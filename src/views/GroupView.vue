<template>
  <b-container fluid class="admin">
    <b-jumbotron class="group-jumbotron" fluid>
      <div>
        <b-link class="back-link" :to="{ name: 'groups' }">
          <font-awesome-icon icon="angle-left" size="xs" />
          <span>Back to groups</span>
        </b-link>
      </div>
      <h1>
        <font-awesome-icon icon="users" size="xs" />
        <span>{{ groupName }}</span>
      </h1>
      <p class="lead">
        Manage the users associated with this group and view the devices
        associated with it.
      </p>
    </b-jumbotron>
    <b-tabs
      card
      class="group-tabs"
      nav-class="container"
      v-model="currentTabIndex"
    >
      <b-tab title="Users">
        <template #title>
          <span>Users</span>
          <b-spinner v-if="isLoading" type="border" small />
          <b-badge v-else pill variant="secondary">{{
            groupUsers.length
          }}</b-badge>
        </template>
        <div class="container" v-if="group && !isLoading">
          <h2>
            Users
            <help>Only administrators can add new users</help>
          </h2>
          <div class="description-and-button-wrapper">
            <p>
              Users can view recordings for the devices associated with this
              group.
            </p>
            <group-user-add
              v-if="isGroupAdmin"
              :group="group"
              @user-added-to-group="onUserAddedToGroup"
            />
            <b-button
              v-if="isGroupAdmin"
              v-b-modal.group-user-add
              variant="primary"
              v-b-tooltip.hover
              title="Add user to group"
              class="add-button"
              data-cy="add_button"
            >
              <font-awesome-icon icon="user-plus" size="xs" />
              <span>Add user</span>
            </b-button>
          </div>

          <div v-if="!groupHasUsers">
            <b-card class="no-content-placeholder">
              <p>This group has no users associated with it.</p>
            </b-card>
          </div>
          <div v-else>
            <b-modal
              id="group-user-remove-self"
              title="Remove yourself from group"
              @ok="removeGroupUser(currentUser.username)"
              ok-title="Remove"
              ok-variant="danger"
              v-model="showUserRemoveSelfModal"
            >
              <p>
                Are you sure you want to remove yourself from this group? You
                will no longer be able to view recordings from the devices in
                this group and you will not be able to add yourself back to the
                group.
              </p>
            </b-modal>
            <b-table
              :items="groupUsers"
              :fields="[
                {
                  key: 'username',
                  label: 'Username',
                  sortable: true,
                },
                {
                  key: 'admin',
                  label: 'Administrator',
                },
                {
                  key: 'controls',
                  label: '',
                  class: 'device-actions-cell',
                },
              ]"
              sort-by="username"
              striped
              hover
              outlined
              responsive
              data-cy="users-table"
            >
              <template v-slot:cell(admin)="data">
                {{ data.item.isAdmin ? "Yes" : "No" }}
              </template>

              <template v-slot:cell(controls)="data">
                <b-button
                  v-if="isGroupAdmin"
                  :disabled="isRemovingUser"
                  v-b-tooltip.hover
                  title="Remove user from group"
                  class="trash-button"
                  variant="light"
                  @click="removeGroupUserCheckIfSelf(data.item.username)"
                >
                  <font-awesome-icon icon="trash" size="1x" />
                </b-button>
              </template>
            </b-table>
          </div>
        </div>
      </b-tab>
      <b-tab title="Devices">
        <template #title>
          <span>Devices</span>
          <b-spinner v-if="isLoading" type="border" small />
          <b-badge v-else pill variant="secondary">{{
            groupDevices.length
          }}</b-badge>
        </template>
        <div class="container" v-if="group && !isLoading">
          <h2>
            Devices
            <help>
              Devices specify which group they belong to when they first
              register. They can't be edited here.
            </help>
          </h2>
          <div class="description-and-button-wrapper">
            <p v-if="groupHasDevices">Devices associated with this group.</p>
            <p v-else class="description-and-button-wrapper">
              There are currently no devices associated with this group.
            </p>
          </div>
          <b-table
            v-if="groupHasDevices"
            :items="groupDevices"
            :fields="[
              {
                key: 'devicename',
                label: 'Device Name',
                sortable: true,
              },
            ]"
            sort-by="devicename"
            hover
            outlined
            responsive
            data-cy="devices-table"
          >
            <template v-slot:cell(devicename)="row">
              <b-link
                :to="{
                  name: 'device',
                  params: { devicename: row.item.devicename },
                }"
              >
                {{ row.item.devicename }}
              </b-link>
            </template>
          </b-table>
        </div>
      </b-tab>
      <b-tab title="Stations" lazy>
        <template #title>
          <span>Stations</span>
          <b-spinner v-if="stations.stationsLoading" type="border" small />
          <b-badge v-else pill variant="secondary">{{
            stations.items.length
          }}</b-badge>
        </template>
        <div class="container">
          <h2>
            Stations
            <help>Stations are named GPS locations.</help>
          </h2>
          <div>
            <div
              v-if="groupHasStations && stations.pendingStations.length === 0"
            >
              <p>Stations that are currently associated with this group</p>
              <l-map
                ref="stationsMap"
                class="stations-map"
                style="height: 400px"
                :bounds="mapBounds.pad(0.25)"
              >
                <l-control-layers />
                <l-w-m-s-tile-layer
                  v-for="layer in stations.map.layers"
                  :key="layer.name"
                  :base-url="layer.url"
                  :layers="layer.layers"
                  :visible="layer.visible"
                  :name="layer.name"
                  :attribution="layer.attribution"
                  layer-type="base"
                />

                <l-marker
                  v-for="station in stationsForMap"
                  :lat-lng="station.location"
                  :key="station.name"
                  :icon="stations.map.icon"
                >
                  <l-tooltip>{{ station.name }}</l-tooltip>
                </l-marker>
              </l-map>
              <b-table-lite :items="stations.items" striped hover />
              <b-btn
                v-if="!stations.enableEditingStations && isGroupAdmin"
                @click="stations.enableEditingStations = true"
              >
                Edit stations
              </b-btn>
            </div>
            <p v-else-if="stations.items.length === 0">
              You currently have no stations associated with this group.
            </p>
            <div
              v-if="
                isGroupAdmin &&
                stations.enableEditingStations &&
                !stations.pendingStations.length
              "
              class="upload-region"
              :class="{ 'dragging-over': stations.draggingCsvOver }"
              @drop.prevent="(e) => droppedStationsCsvFile(e)"
              @dragenter.prevent="(e) => dragCsvFileOver(e)"
              @dragover.prevent="() => {}"
              @dragleave.prevent="(e) => dragCsvFileOut(e)"
            >
              <div v-if="!stations.draggingCsvOver">
                <p>
                  Upload Trap.nz CSV defined stations: choose a file, or drag
                  and drop one onto this box.
                </p>
                <div>
                  <input
                    accept=".csv"
                    id="upload-csv"
                    type="file"
                    title="Choose CSV"
                    @change="(e) => gotStationsCsvFile(e)"
                    class="upload stations"
                  />
                </div>
              </div>
              <div v-else class="drag-instructions">Drop your CSV here.</div>
            </div>
            <div v-else-if="!isGroupAdmin">
              You need to ask your group administrator to add stations
            </div>
            <div v-if="stations.pendingStations.length !== 0">
              <p>The following changes will be made</p>
              <b-table class="station-diff-table" :items="pendingStationsDiff">
                <template #cell(latitude)="data">
                  <span v-html="data.value" />
                </template>
                <template #cell(longitude)="data">
                  <span v-html="data.value" />
                </template>
              </b-table>
              <b-checkbox
                class="back-date"
                v-model="stations.backDateRecordings"
                >Apply changes to recordings starting from a date</b-checkbox
              >
              <div v-if="stations.backDateRecordings" class="back-date">
                <b-form-datepicker v-model="stations.applyStationsFromDate" />
              </div>
              <b-btn
                @click="() => addNewStations()"
                :disabled="stations.addingStations"
                >Confirm changes</b-btn
              >
              <b-btn
                @click="pendingStations = []"
                :disabled="stations.addingStations"
                >Discard changes</b-btn
              >
            </div>
          </div>
        </div>
      </b-tab>
    </b-tabs>
  </b-container>
</template>

<script lang="ts">
import { mapState } from "vuex";
import * as csv from "csvtojson";
import {
  LMap,
  LMarker,
  LTooltip,
  LWMSTileLayer,
  LControlLayers,
} from "vue2-leaflet";
import { latLng, latLngBounds, icon } from "leaflet";
import api from "@/api";
import Help from "@/components/Help.vue";
import GroupUserAdd from "@/components/Groups/GroupUserAdd.vue";
import {linzBasemapApiKey} from "../config";

const Marker = icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 40],
  shadowUrl: "/marker-shadow.png",
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

interface StationData {
  name: string;
  lat: number;
  lng: number;
}

export default {
  name: "GroupView",
  components: {
    Help,
    GroupUserAdd,
    LMap,
    LControlLayers,
    LMarker,
    LTooltip,
    LWMSTileLayer,
  },
  data() {
    return {
      stations: {
        map: {
          layers: [
            {
              name: "LINZ Basemap",
              visible: true, // Make the LINZ basemap the default one
              attribution:
                '<a href="//www.linz.govt.nz/data/linz-data/linz-basemaps/data-attribution">LINZ CC BY 4.0 © Imagery Basemap contributors</a>',
              url:
                `https://basemaps.linz.govt.nz/v1/tiles/aerial/3857/{z}/{x}/{y}.webp?api=${linzBasemapApiKey}`,
            },
            {
              name: "OpenStreetMap Basemap",
              visible: false,
              url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
              attribution:
                '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            },
          ],
          icon: Marker,
        },
        // Stations state
        backDateRecordings: false,
        applyStationsFromDate: null,
        stationsLoading: false,
        addingStations: false,
        items: [],
        pendingStations: [],
        draggingCsvOver: false,
        enableEditingStations: true,
      },
      isLoading: false, // Loading all data on page load
      group: null,
      currentTabIndex: 0, // Which tab is the default one
      showUserRemoveSelfModal: false,
      isRemovingUser: false,
    };
  },
  computed: {
    ...mapState({
      currentUser: (state) => (state as any).User.userData,
    }),
    groupName() {
      return this.$route.params.groupname;
    },
    isGroupAdmin() {
      if (
        (this.currentUser && this.currentUser.isSuperUser) ||
        (this.group && this.group.Users)
      ) {
        return (
          this.currentUser.isSuperUser ||
          this.groupUsers.some(
            (user) =>
              user.username === this.currentUser.username && user.isAdmin
          )
        );
      }
      return false;
    },
    groupUsers() {
      return (this.group && this.group.GroupUsers) || [];
    },
    groupDevices() {
      return (this.group && this.group.Devices) || [];
    },
    groupHasDevices() {
      return this.groupDevices.length !== 0;
    },
    groupHasUsers() {
      return this.groupUsers.length !== 0;
    },
    groupHasStations() {
      return this.stations.items.length !== 0;
    },
    stationsForMap() {
      // Stations lat/lng as leaflet lat/lng objects
      return this.stations.items.map(({ name, latitude, longitude }) => ({
        name,
        location: latLng(latitude, longitude),
      }));
    },
    mapBounds() {
      // Calculate the initial map bounds and zoom level from the set of lat/lng points
      return latLngBounds(this.stationsForMap.map(({ location }) => location));
    },
    pendingStationsDiff() {
      // Show pending stations, and mark any existing stations that don't have a match in pending as
      // "will be retired".  Any existing stations with lat/lng changes get marked as "will be updated".
      const diff = {};
      const existingStationsByName = {};
      const pendingStationsByName = {};
      for (const station of this.stations.items) {
        existingStationsByName[station.name] = station;
      }
      for (const station of this.stations.pendingStations) {
        pendingStationsByName[station.name] = station;
      }
      for (const station of this.stations.items) {
        if (!pendingStationsByName.hasOwnProperty(station.name)) {
          diff[station.name] = {
            ...station,
            _rowVariant: "retire-item",
            action: "retire",
          };
        } else {
          const updatedStation = pendingStationsByName[station.name];
          const EPSILON = 0.000000000001;
          if (
            Math.abs(updatedStation.latitude - station.latitude) > EPSILON ||
            Math.abs(updatedStation.longitude - station.longitude) > EPSILON
          ) {
            let { latitude, longitude } = updatedStation;
            if (Math.abs(latitude - station.latitude) > EPSILON) {
              latitude = `<del>${station.latitude}</del> -> ${latitude}`;
            }
            if (Math.abs(longitude - station.longitude) > EPSILON) {
              longitude = `<del>${station.longitude}</del> -> ${longitude}`;
            }
            diff[station.name] = {
              ...updatedStation,
              latitude,
              longitude,
              _rowVariant: "update-item",
              action: "update",
            };
          } else {
            diff[station.name] = {
              ...updatedStation,
              _rowVariant: "no-change-item",
              action: "no change",
            };
          }
        }
      }
      for (const station of this.stations.pendingStations) {
        if (!diff.hasOwnProperty(station.name)) {
          diff[station.name] = {
            ...station,
            _rowVariant: "add-item",
            action: "add",
          };
        }
      }
      return (Object.values(diff) as StationData[]).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    },
  },
  created() {
    this.fetchGroup();
    this.fetchStations();
  },
  methods: {
    // Stations:
    dragCsvFileOver(event: DragEvent) {
      this.stations.draggingCsvOver = true;
      event.dataTransfer.dropEffect = "none";
    },
    dragCsvFileOut() {
      this.stations.draggingCsvOver = false;
    },
    async droppedStationsCsvFile(event: DragEvent) {
      this.stations.draggingCsvOver = false;
      const csvText = await event.dataTransfer.files[0].text();
      await this.parseStationsCsv(csvText);
    },
    async gotStationsCsvFile(event: Event) {
      const file: File = (event.target as HTMLInputElement).files[0];
      const csvText = await file.text();
      await this.parseStationsCsv(csvText);
    },
    async parseStationsCsv(csvText: string) {
      const monitoring = await csv().fromString(csvText);
      this.stations.pendingStations = monitoring
        .filter((item) => item.Type === "Camera")
        .map((item) => ({
          name: item["Number / Code"],
          latitude: item.Lat,
          longitude: item.Lon,
        }));
    },
    async fetchGroup() {
      this.isLoading = true;
      {
        // TODO: This currently fetches everything to do with a group,
        //  but would probably be better separated into individual API calls.
        const { result } = await api.groups.getGroups(this.groupName);
        this.group = result.groups[0];
      }
      this.isLoading = false;
    },
    async fetchStations() {
      this.stations.stationsLoading = true;
      {
        const { result } = await api.groups.getStationsForGroup(this.groupName);
        this.stations.items = result.stations
          .filter(({ retiredAt }) => retiredAt === null)
          .map(({ name, location }) => ({
            name,
            latitude: location.coordinates[0],
            longitude: location.coordinates[1],
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        if (this.stations.items.length !== 0) {
          this.stations.enableEditingStations = false;
        }
      }
      this.stations.stationsLoading = false;
    },
    async addNewStations() {
      this.stations.addingStations = true;
      {
        let applyFromDate =
          this.stations.backDateRecordings &&
          this.stations.applyStationsFromDate;
        if (applyFromDate) {
          applyFromDate = new Date(Date.parse(applyFromDate));
          applyFromDate.setHours(5);
          applyFromDate.setMinutes(0);
          applyFromDate.setSeconds(0);
          applyFromDate.setMilliseconds(0);
        }
        await api.groups.addStationsToGroup(
          this.groupName,
          this.stations.pendingStations.map(
            ({ name, latitude, longitude }) => ({
              name,
              lat: Number(latitude),
              lng: Number(longitude),
            })
          ),
          applyFromDate
        );
        await this.fetchStations();
        this.stations.pendingStations = [];
      }
      this.stations.addingStations = false;
    },

    // Users:
    async onUserAddedToGroup() {
      await this.fetchGroup();
    },
    async removeGroupUser(userName: string) {
      this.isRemovingUser = true;
      {
        await api.groups.removeGroupUser(this.group.groupname, userName);
        // Mutate our local users object, we don't need to fetch it again.
        this.group.GroupUsers = this.groupUsers.filter(
          (user) => user.username !== userName
        );
      }
      this.isRemovingUser = false;
    },
    async removeGroupUserCheckIfSelf(userName: string) {
      if (
        !this.currentUser.isSuperUser &&
        userName === this.currentUser.username
      ) {
        this.showUserRemoveSelfModal = true;
      } else {
        await this.removeGroupUser(userName);
      }
    },
  },
};
</script>

<style lang="scss">
.admin .group-jumbotron {
  margin-bottom: unset;
}
.group-tabs {
  .card-header {
    // Same color as the jumbotron component abutting above the tabs.
    background-color: #f8f9fa;
    .card-header-tabs {
      margin-left: auto;
      margin-right: auto;
    }
  }
}
.upload-region {
  width: 100%;
  min-height: 200px;
  border: 5px dashed #ccc;
  padding: 0 30px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease-in-out;
  &.dragging-over {
    background-color: #eee;
  }
  .drag-instructions {
    pointer-events: none;
  }
}
.station-diff-table {
  del {
    color: darkred;
  }
  .table-add-item {
    background: #cff1d7;
  }
  .table-update-item {
    background: #f6ddb9;
  }
  .table-retire-item {
    background: #eecccf;
  }
}
.back-date {
  margin-bottom: 20px;
}
</style>
