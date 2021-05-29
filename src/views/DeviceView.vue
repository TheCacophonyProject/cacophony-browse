<template>
  <b-container fluid class="admin">
    <b-jumbotron class="jumbotron" fluid>
      <h1>
        <!--        TODO(jon): Maybe active router-link component -->
        <router-link
          v-if="userIsMemberOfGroup"
          :to="{
            name: 'group',
            params: {
              groupName,
              tabName: 'devices',
            },
          }"
        >
          <font-awesome-icon
            icon="users"
            size="xs"
            style="color: #666; font-size: 16px"
          />
          <span>{{ groupName }}</span>
        </router-link>
        <span v-else>
          <font-awesome-icon
            icon="users"
            size="xs"
            style="color: #666; font-size: 16px"
          />
          <span>{{ groupName }}</span>
        </span>
        <font-awesome-icon
          icon="chevron-right"
          size="xs"
          style="color: #666; font-size: 16px"
        />
        <font-awesome-icon icon="microchip" size="xs" />
        <span>{{ deviceName }}</span>
      </h1>
      <p class="lead">Manage this device.</p>
    </b-jumbotron>

    <div v-if="!loadedDevice" class="container no-tabs">
      Loading device...
      <spinner :fetching="!loadedDevice" />
    </div>
    <div v-else-if="device && device.id">
      <device-detail
        :device="device"
        :user="currentUser"
        :software="softwareDetails"
        class="dev-details"
        @reload-device="fetchDevice"
      />
    </div>
    <div v-else class="container no-tabs">
      Sorry but group <i> &nbsp; {{ groupName }} &nbsp; </i> does not have a
      device called <i> &nbsp; {{ deviceName }}</i
      >.
    </div>
  </b-container>
</template>

<script>
import { mapState } from "vuex";
import DeviceDetail from "../components/Devices/DeviceDetail.vue";
import Spinner from "../components/Spinner.vue";
import api from "../api/index";

export default {
  name: "DeviceView",
  components: { DeviceDetail, Spinner },
  computed: {
    ...mapState({
      currentUser: (state) => state.User.userData,
    }),
    userIsSuperUserAndViewingAsSuperUser() {
      return false;
    },
    userIsMemberOfGroup() {
      return (
        this.userIsSuperUserAndViewingAsSuperUser ||
        (this.group.GroupUsers &&
          this.group.GroupUsers.find(
            ({ username }) => username === this.currentUser.username
          ) !== undefined)
      );
    },
    deviceName() {
      return this.$route.params.deviceName;
    },
    groupName() {
      return this.$route.params.groupName;
    },
  },
  data() {
    return {
      loadedDevice: false,
      device: {},
      group: {},
      softwareDetails: { message: "Retrieving version information..." },
    };
  },
  watch: {
    $route() {
      const nextDevice = this.deviceName;
      if (nextDevice !== this.device.deviceName) {
        // Only if the device changed.
        this.queryDevice();
      }
    },
  },
  created() {
    this.queryDevice();
  },
  methods: {
    queryDevice: async function () {
      this.loadedDevice = false;
      try {
        const { result } = await api.groups.getGroup(this.groupName);
        this.group = result.groups[0];

        console.log(this.group, this.currentUser, this.userIsMemberOfGroup);

        await this.fetchDevice();
        if (this.device) {
          await this.getSoftwareDetails(this.device.id);
        }
      } catch (e) {
        // TODO - we will move away from global error handling, and show any errors locally in the component
      }
      this.loadedDevice = true;
    },
    fetchDevice: async function () {
      const request = await api.device.getDevice(
        this.groupName,
        this.deviceName
      );
      this.device = request.result.device;
    },
    getSoftwareDetails: async function (deviceId) {
      const results = await api.device.getLatestSoftwareVersion(deviceId);
      if (results.success && results.result.rows.length > 0) {
        this.softwareDetails.message = "Success";
        this.softwareDetails.result = results.result.rows[0];
      } else {
        this.softwareDetails = {
          message: "No version information is available for this device.",
        };
      }
    },
  },
};
</script>
<style lang="scss">
.admin .jumbotron {
  margin-bottom: unset;
}
div .dev-details {
  margin: 0;
  padding: 0;
  max-width: unset;
}

.no-tabs {
  padding: 2em 0;
}
</style>
