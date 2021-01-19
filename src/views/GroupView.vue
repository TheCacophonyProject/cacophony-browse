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
      <b-tab title="Stations">
        <div class="container">
          <h2>
            Stations
            <help>Stations are named GPS locations.</help>
          </h2>
          <div>
            <p v-if="groupHasStations">Stations for this group.</p>
            <div v-else>
              <div v-if="pendingStations.length === 0">
                <p>There are currently no stations defined for this group.</p>
                <div
                  class="upload-region"
                  :class="{ 'dragging-over': draggingCsvOver }"
                  @drop.prevent="(e) => droppedStationsCsvFile(e)"
                  @dragenter.prevent="(e) => dragCsvFileOver(e)"
                  @dragover.prevent="() => {}"
                  @dragleave.prevent="(e) => dragCsvFileOut(e)"
                >
                  <div v-if="!draggingCsvOver">
                    <p>
                      Upload Trap.nz CSV defined stations: choose a file, or
                      drag and drop one onto this box.
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
                  <div v-else class="drag-instructions">
                    Drop your CSV here.
                  </div>
                </div>
              </div>
              <div v-else>
                <p>
                  The following stations will be added. Any existing stations
                  will be deleted.
                </p>
                <b-table-lite :items="pendingStations" striped hover />
                <b-btn>Confirm changes</b-btn>
                <b-btn @click="pendingStations = []">Discard changes</b-btn>
              </div>
            </div>
          </div>
        </div>
      </b-tab>
    </b-tabs>
  </b-container>
</template>

<script lang="ts">
import { mapState } from "vuex";
import api from "@/api";
import Spinner from "@/components/Spinner.vue";
import Help from "@/components/Help.vue";
import GroupUserAdd from "@/components/Groups/GroupUserAdd.vue";
import * as csv from "csvtojson";

export default {
  name: "GroupView",
  components: { Spinner, Help, GroupUserAdd },
  data() {
    return {
      isLoading: false,
      group: null,
      currentTabIndex: 0,
      showUserRemoveSelfModal: false,
      isRemovingUser: false,
      pendingStations: [],
      draggingCsvOver: false,
    };
  },
  computed: {
    ...mapState({
      currentUser: (state) => state.User.userData,
    }),
    groupName() {
      return this.$route.params.groupname;
    },
    isGroupAdmin() {
      if (this.currentUser && this.group.Users) {
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
    groupHasStations() {
      // And this.group.GroupStations is null or whatever
      return false; //this.pendingStations.length !== 0;
    },
    groupHasUsers() {
      return this.groupUsers.length !== 0;
    },
  },
  created() {
    this.fetchGroup();
  },
  methods: {
    dragCsvFileOver(event: Event) {
      this.draggingCsvOver = true;
      event.dataTransfer.dropEffect = "none";
    },
    dragCsvFileOut(event: Event) {
      this.draggingCsvOver = false;
    },
    async droppedStationsCsvFile(event: Event) {
      this.draggingCsvOver = false;
      const csvText = await event.dataTransfer.files[0].text();
      await this.parseStationsCsv(csvText);
    },
    async gotStationsCsvFile(event: Event) {
      const file: File = event.target.files[0];
      const csvText = await file.text();
      await this.parseStationsCsv(csvText);
    },
    async parseStationsCsv(csvText: string) {
      const monitoring = await csv().fromString(csvText);
      this.pendingStations = monitoring
        .filter((item) => item.Type === "Camera")
        .map((item) => ({
          Name: item["Number / Code"],
          Latitude: item.Lat,
          Longitude: item.Lon,
        }));
    },
    async fetchGroup() {
      this.isLoading = true;
      {
        try {
          // TODO(jon): This currently fetches everything to do with a group, but would probably be better separated into individual API calls.
          const { result } = await api.groups.getGroupByName(this.groupName);
          this.group = result.groups[0];
        } catch (error) {
          console.warn(error);
          // TODO(jon): Do something with the error.
        }
      }
      this.isLoading = false;
    },
    async onUserAddedToGroup() {
      await this.fetchGroup();
    },
    async removeGroupUser(userName: string) {
      this.isRemovingUser = true;
      {
        try {
          await api.groups.removeGroupUser(this.group.groupname, userName);
          // Mutate our local users object, we don't need to fetch it again.
          this.group.GroupUsers = this.groupUsers.filter(
            (user) => user.username !== userName
          );
        } catch (error) {
          console.warn(error);
          // TODO(jon): Handle error
        }
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
</style>
