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
        <UsersTab
          :users="groupUsers"
          :is-group-admin="isGroupAdmin"
          :loading="isLoading"
          :group-name="groupName"
          @user-added="() => fetchGroup()"
        />
      </b-tab>
      <b-tab title="Devices">
        <template #title>
          <span>Devices</span>
          <b-spinner v-if="isLoading" type="border" small />
          <b-badge v-else pill variant="secondary">{{
            groupDevices.length
          }}</b-badge>
        </template>
        <DevicesTab :devices="groupDevices" :loading="isLoading" />
      </b-tab>
      <b-tab title="Stations" lazy>
        <template #title>
          <span>Stations</span>
          <b-spinner v-if="stationsLoading" type="border" small />
          <b-badge v-else pill variant="secondary">{{
            stations.length
          }}</b-badge>
        </template>
        <StationsTab
          :items="stations"
          :loading="stationsLoading"
          :group-name="groupName"
          :is-group-admin="isGroupAdmin"
          @change="() => fetchStations()"
        />
      </b-tab>
    </b-tabs>
  </b-container>
</template>

<script lang="ts">
import { mapState } from "vuex";
import api from "@/api";
import StationsTab from "@/components/Groups/StationsTab.vue";
import UsersTab from "@/components/Groups/UsersTab.vue";
import DevicesTab from "@/components/Groups/DevicesTab.vue";
export default {
  name: "GroupView",
  components: {
    UsersTab,
    StationsTab,
    DevicesTab,
  },
  data() {
    return {
      stationsLoading: false,
      isLoading: false, // Loading all data on page load
      groupUsersAndDevices: null,
      stations: [],
      currentTabIndex: 0, // Which tab is the default one
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
        (this.groupUsersAndDevices && this.groupUsersAndDevices.Users)
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
      return (
        (this.groupUsersAndDevices && this.groupUsersAndDevices.GroupUsers) ||
        []
      );
    },
    groupDevices() {
      return (
        (this.groupUsersAndDevices && this.groupUsersAndDevices.Devices) || []
      );
    },
  },
  created() {
    this.fetchGroup();
    this.fetchStations();
  },
  methods: {
    async fetchGroup() {
      this.isLoading = true;
      {
        // TODO: This currently fetches everything to do with a group,
        //  but would probably be better separated into individual API calls.
        const { result } = await api.groups.getGroups(this.groupName);
        this.groupUsersAndDevices = result.groups[0];
      }
      this.isLoading = false;
    },
    async fetchStations() {
      this.stationsLoading = true;
      {
        const { result } = await api.groups.getStationsForGroup(this.groupName);
        this.stations = result.stations;
      }
      this.stationsLoading = false;
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
</style>
