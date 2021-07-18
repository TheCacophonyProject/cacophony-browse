<template>
  <b-container fluid class="admin">
    <b-jumbotron class="jumbotron" fluid>
      <h1>Your groups</h1>
      <p class="lead">
        Groups link together devices with the users who can view their
        recordings. Click on a group to see its devices and users.
      </p>
    </b-jumbotron>
    <b-container class="groups-container">
      <b-row v-if="isLoading">
        <spinner />
      </b-row>
      <b-row v-else>
        <b-col class="col-md-6 col-12">
          <group-add />
          <div class="add-button-wrapper">
            <b-button
              v-b-modal.group-add
              variant="primary"
              v-b-tooltip.hover
              title="Add a new group"
              class="add-button"
            >
              <font-awesome-icon icon="plus" size="xs" />
              <span>Create group</span>
            </b-button>
          </div>
          <div v-if="hasGroups" class="group-list-wrapper">
            <b-checkbox class="filter-option" v-model="showGroupsWithNoDevices"
              >Include groups with no devices</b-checkbox
            >
            <b-list-group data-cy="groups-list">
              <b-list-group-item
                :class="[
                  'list-group-item',
                  'list-group-item-action',
                  { 'no-devices': deviceCount === 0 },
                ]"
                :key="groupName"
                :to="{
                  name: 'group',
                  params: { groupName, tabName: 'devices' },
                }"
                v-for="{ groupName, deviceCount, userCount } in filteredGroups"
              >
                <span>
                  <strong>{{ groupName }}</strong> -
                  <span v-if="deviceCount !== false"
                    >{{ deviceCount || "No" }} device<span
                      v-if="deviceCount !== 1"
                      >s</span
                    >
                    with {{ userCount || "No" }} user<span
                      v-if="userCount !== 1"
                      >s</span
                    ></span
                  ><b-spinner v-else type="border" small />
                </span>
                <font-awesome-icon
                  class="icon"
                  icon="chevron-right"
                  size="xs"
                />
              </b-list-group-item>
            </b-list-group>
          </div>
          <div v-else class="col-12 col-lg-8">
            <b-card class="no-content-placeholder">
              <h5>You don't belong to any groups yet</h5>
              <p>
                If you are setting up a device, create a group. All the devices
                you manage will be linked together through this group, so choose
                a name relating to your organisation, project or property.
              </p>
            </b-card>
          </div>
        </b-col>
        <b-col class="col-md-6 col-12">
          <l-map
            style="height: 500px"
            :bounds="mapBounds"
            class="groups-map"
            v-if="!locationsLoading"
          >
            <l-w-m-s-tile-layer
              v-for="layer in mapLayers"
              :key="layer.name"
              :base-url="layer.url"
              :layers="layer.layers"
              :visible="layer.visible"
              :name="layer.name"
              :attribution="layer.attribution"
              layer-type="base"
            />
            <l-circle-marker
              v-for="{ location, groups, types } in groupsByLocation"
              :lat-lng="location"
              :key="`${location.lat}_${location.lng}`"
              :radius="5"
              color="black"
              :fill-opacity="1"
              :fill-color="colorForType(types)"
              :weight="0.5"
              @click="(e) => navigateToGroup(groups[0])"
            >
              <l-tooltip>
                <font-awesome-icon
                  v-if="types === 'thermalRaw'"
                  icon="video"
                  class="icon"
                  size="xs"
                />
                <font-awesome-icon
                  v-else-if="types === 'audio'"
                  icon="music"
                  class="icon"
                  size="xs"
                />
                <font-awesome-icon
                  v-else
                  icon="users"
                  class="icon"
                  size="xs"
                />
                {{ groups.map((d) => d).join(", ") }}
              </l-tooltip>
            </l-circle-marker>
          </l-map>
          <div class="map-loading" v-else>
            <b-spinner small />
            <div>&nbsp;Loading group locations</div>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </b-container>
</template>

<script lang="ts">
import api from "@/api";
import Spinner from "@/components/Spinner.vue";
import GroupAdd from "@/components/Groups/GroupAdd.vue";

import { linzBasemapApiKey } from "@/config";
import { LatLng, latLng, latLngBounds } from "leaflet";
import { LCircleMarker, LMap, LTooltip, LWMSTileLayer } from "vue2-leaflet";

interface GroupsForLocation {
  location: LatLng;
  groups: string[]; // Multiple devices can be in the same place
  types: "audio" | "thermalRaw" | "both" | null;
}

interface GroupsViewData {
  groups: any[];
  isLoading: boolean;
  locationsLoading: boolean;
  showGroupsWithNoDevices: boolean;
  locations: Record<string, GroupsForLocation>;
  requestController: AbortController;
}

const NZ_BOUNDS = latLngBounds([
  latLng(-33.6233075, 176.6248297),
  latLng(-47.5254414, 164.9880683),
]);

const isInNZ = (location: LatLng): boolean => {
  return NZ_BOUNDS.contains(location);
};

export default {
  name: "GroupsView",
  components: {
    Spinner,
    GroupAdd,
    LMap,
    LTooltip,
    LCircleMarker,
    LWMSTileLayer,
  },
  data(): GroupsViewData {
    return {
      groups: [],
      isLoading: false,
      showGroupsWithNoDevices: false,
      locationsLoading: false,
      locations: {},
      requestController: null,
    };
  },
  computed: {
    hasGroups(): boolean {
      return this.groups.length !== 0;
    },
    mapLayers() {
      const OpenStreetMapFallbackLayer = {
        name: "OpenStreetMap Basemap",
        visible: false,
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      };
      if (linzBasemapApiKey && linzBasemapApiKey !== "YOUR_API_KEY_HERE") {
        return [
          {
            name: "LINZ Basemap",
            visible: true, // Make the LINZ basemap the default one
            attribution:
              '<a href="//www.linz.govt.nz/data/linz-data/linz-basemaps/data-attribution">LINZ CC BY 4.0 © Imagery Basemap contributors</a>',
            url: `https://basemaps.linz.govt.nz/v1/tiles/aerial/3857/{z}/{x}/{y}.webp?api=${linzBasemapApiKey}`,
          },
          {
            name: "LINZ Topo",
            visible: false, // Make the LINZ basemap the default one
            attribution:
              '<a href="//www.linz.govt.nz/data/linz-data/linz-basemaps/data-attribution">LINZ CC BY 4.0 © Imagery Basemap contributors</a>',
            url: `http://tiles-a.data-cdn.linz.govt.nz/services;key=${linzBasemapApiKey}/tiles/v4/layer=767/EPSG:3857/{z}/{x}/{y}.png`,
          },
          OpenStreetMapFallbackLayer,
        ];
      }
      return [{ ...OpenStreetMapFallbackLayer, visible: true }];
    },
    groupsByLocation(): GroupsForLocation[] {
      return Object.values(this.locations);
    },
    mapBounds() {
      // Calculate the initial map bounds and zoom level from the set of lat/lng points
      return (
        (this.groupsByLocation.length &&
          latLngBounds(
            this.groupsByLocation.map(({ location }) => location)
          )) ||
        NZ_BOUNDS
      );
    },
    filteredGroups(): any[] {
      if (this.showGroupsWithNoDevices) {
        return this.groups;
      }
      return this.groups.filter(
        (group) =>
          group.initialDeviceCount !== 0 &&
          (group.deviceCount === false || group.deviceCount !== 0)
      );
    },
  },
  created: function () {
    this.fetchGroups();
  },
  methods: {
    navigateToGroup(groupName: string) {
      this.$router.push({
        name: "group",
        params: { groupName, tabName: "devices" },
      });
    },
    colorForType(type: string) {
      switch (type) {
        case "thermalRaw":
          return "dodgerblue";
        case "audio":
          return "greenyellow";
        case "both":
          return "orange";
      }
    },
    async fetchGroups() {
      this.isLoading = true;
      this.locationsLoading = true;
      {
        // TODO(jon): Error handling.

        try {
          const { result } = await api.groups.getGroups();
          // Groups are always ordered alphabetically.
          // TODO(jon): Maybe also show groups that have devices with issues here?
          this.groups = result.groups
            .map(({ groupname, GroupUsers, Devices }) => ({
              groupName: groupname,
              deviceCount: Devices.length === 0 ? 0 : false,
              initialDeviceCount: Devices.length,
              userCount: GroupUsers.length,
            }))
            .sort((a, b) => a.groupName.localeCompare(b.groupName));

          const devicesForGroupsPromises = [];
          const locations = {};
          for (const group of this.groups) {
            if (group.initialDeviceCount !== 0) {
              devicesForGroupsPromises.push(
                new Promise((resolve) => {
                  api.groups
                    // FIXME: We only need to do this because getGroups returns both active and inactive devices right now.
                    .getDevicesForGroup(group.groupName)
                    .then(async ({ result }) => {
                      group.deviceCount = result.devices.length;
                      const latestRecordingForDevicesPromises = [];
                      // TODO(jon): Use latest events too, to see which devices have phoned home lately.
                      // TODO(jon): The order of this probably wants to be one device per group, then fill out the rest.
                      // TODO(jon): Also toggle between bird monitors and thermalRecorders
                      // TODO(jon): Could always draw these just as group circles, that cover the radius of all devices?
                      const device = result.devices.pop();

                      // TODO(jon): Would be useful to be able to get the latest recording for each of a list of devices in a single request?
                      device &&
                        latestRecordingForDevicesPromises.push(
                          api.recording.latestForDevice(device.id)
                        );

                      const latestRecordingForFirstDeviceInGroup =
                        await Promise.all(latestRecordingForDevicesPromises);
                      resolve(latestRecordingForFirstDeviceInGroup);
                    })
                    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
                    .catch((_) => {});
                })
              );
            }
          }
          Promise.all(devicesForGroupsPromises)
            .then((devicesForGroups) => {
              for (const results of devicesForGroups) {
                for (const recordings of results) {
                  if (
                    recordings.result.count !== 0 &&
                    recordings.result.rows[0].location
                  ) {
                    const rec = recordings.result.rows[0];
                    const location = latLng(
                      rec.location.coordinates[0],
                      rec.location.coordinates[1]
                    );
                    if (isInNZ(location)) {
                      if (!locations.hasOwnProperty(location.toString())) {
                        locations[location.toString()] = {
                          location,
                          groups: [],
                          types: "both",
                        };
                      }
                      const loc = locations[location.toString()];
                      // if (
                      //   (loc.types === "audio" && rec.type === "thermalRaw") ||
                      //   (loc.types === "thermalRaw" && rec.type === "audio")
                      // ) {
                      //   loc.types = "both";
                      // } else if (loc.types === null) {
                      //   loc.types = rec.type;
                      // }
                      loc.groups.push(rec.Group.groupname);
                    }
                  }
                }
              }
              this.locations = locations;
              this.locationsLoading = false;
            })
            .catch(() => {});
        } catch (error) {
          // Do something with the error.
        }
      }
      this.isLoading = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.groups-container {
  padding-top: 20px;
}
.group-list-wrapper {
  overflow-y: auto;
  border-top: 1px solid rgb(248, 249, 250);
  border-bottom: 1px solid rgb(248, 249, 250);
  max-height: calc(100vh - 350px);
  margin-bottom: 10px;
}
@media only screen and (max-width: 576px) {
  .groups-map {
    display: none;
  }
}

.list-group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  &.no-devices {
    //background: #eee;
    opacity: 0.5;
  }
}
.map-loading {
  background: #eee;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #444;
}
.filter-option {
  margin: 10px;
}
</style>
