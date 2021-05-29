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
      <b-tab>
        <template #title>
          <TabTemplate
            title="Users"
            :isLoading="usersLoading"
            :value="users.length"
          />
        </template>
        <UsersTab
          :users="users"
          :is-group-admin="isGroupAdmin"
          :loading="usersLoading"
          :group-name="groupName"
          @user-added="() => fetchUsers()"
          @user-removed="(userName) => removedUser(userName)"
        />
      </b-tab>
      <b-tab title="Devices">
        <template #title>
          <TabTemplate
            title="Devices"
            :isLoading="devicesLoading"
            :value="devices.length"
            :has-warnings="anyDevicesAreUnhealthy"
          />
        </template>
        <DevicesTab
          :devices="devices"
          :loading="devicesLoading"
          :group-name="groupName"
        />
      </b-tab>
      <b-tab lazy>
        <template #title>
          <TabTemplate
            title="Stations"
            :isLoading="stationsLoading"
            :value="nonRetiredStationsCount"
          />
        </template>
        <StationsTab
          :items="stations"
          :loading="stationsLoading"
          :group-name="groupName"
          :is-group-admin="isGroupAdmin"
          @change="() => fetchStations()"
        />
      </b-tab>
      <b-tab lazy>
        <template #title>
          <TabTemplate
            title="Recordings"
            :isLoading="recordingsLoading"
            :value="recordings.length"
          />
        </template>
        <RecordingsTab
          :items="recordings"
          :loading="recordingsLoading"
          :group-name="groupName"
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
import TabTemplate from "@/components/TabTemplate.vue";
import RecordingsTab from "@/components/Groups/RecordingsTab.vue";

export default {
  name: "GroupView",
  components: {
    RecordingsTab,
    UsersTab,
    StationsTab,
    DevicesTab,
    TabTemplate,
  },
  data() {
    return {
      stationsLoading: false,
      usersLoading: false, // Loading all users on page load
      devicesLoading: false, // Loading all users on page load
      recordingsLoading: false,
      users: [],
      devices: [],
      stations: [],
      recordings: [],
      tabNames: ["users", "devices", "stations", "recordings"],
    };
  },
  computed: {
    ...mapState({
      currentUser: (state) => (state as any).User.userData,
    }),
    groupName() {
      return this.$route.params.groupName;
    },
    isGroupAdmin() {
      return (
        (this.currentUser && this.currentUser.isSuperUser) ||
        this.users.some(
          (user) =>
            user.userName === this.currentUser.username && user.isGroupAdmin
        )
      );
    },
    nonRetiredStationsCount(): number {
      return this.stations.filter((station) => station.retiredAt === null)
        .length;
    },
    currentTabName() {
      return this.$route.params.tabName;
    },
    currentTabIndex: {
      get() {
        return Math.max(0, this.tabNames.indexOf(this.currentTabName));
      },
      set(tabIndex) {
        const nextTabName = this.tabNames[tabIndex];
        if (nextTabName !== this.currentTabName) {
          this.$router.push({
            name: "group",
            params: {
              groupName: this.groupName,
              tabName: nextTabName,
            },
          });
        }
      },
    },
    anyDevicesAreUnhealthy() {
      return this.devices.some((device) => device.isHealthy === false);
    },
  },
  created() {
    const nextTabName = this.tabNames[this.currentTabIndex];
    if (nextTabName !== this.currentTabName) {
      this.$router.replace({
        name: "group",
        params: {
          groupName: this.groupName,
          tabName: nextTabName,
        },
      });
    }
    this.currentTabIndex = this.tabNames.indexOf(this.currentTabName);
    this.fetchUsers();
    this.fetchDevices();
    this.fetchStations();
  },
  methods: {
    async fetchUsers() {
      this.usersLoading = true;
      {
        const { result } = await api.groups.getUsersForGroup(this.groupName);
        this.users = result.users;
      }
      this.usersLoading = false;
    },
    async fetchDevices() {
      this.devicesLoading = true;
      {
        const { result } = await api.groups.getDevicesForGroup(this.groupName);
        this.devices = result.devices.map((device) => ({
          ...device,
          isHealthy: true,
        }));

        const last24Hours = new Date(
          new Date().getTime() - 60 * 1000 * 60 * 24
        ).toISOString();

        // Get device health.
        //This is secondary info, so fine to lazy load
        for (const device of this.devices) {
          api.device
            .getLatestEvents(device.id, {
              limit: 1,
              type: "daytime-power-off",
              startTime: last24Hours,
            })
            .then(({ result }) => {
              device.isHealthy = result.rows.length !== 0;
            });
        }
      }
      this.devicesLoading = false;
    },
    async fetchStations() {
      this.stationsLoading = true;
      {
        const { result } = await api.groups.getStationsForGroup(this.groupName);
        this.stations = result.stations;
      }
      this.stationsLoading = false;
    },
    removedUser(userName: string) {
      this.users = this.users.filter((user) => user.userName !== userName);
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
