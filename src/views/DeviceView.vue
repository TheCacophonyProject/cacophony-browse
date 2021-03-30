<template>
  <b-container fluid class="admin">
    <b-jumbotron class="jumbotron" fluid>
      <div>
        <b-link
          class="back-link"
          :to="{
            name: 'devices',
          }"
        >
          <font-awesome-icon icon="angle-left" size="xs" />
          <span>Back to devices</span>
        </b-link>
      </div>
      <h1>
        <font-awesome-icon icon="microchip" size="xs" />
        <span v-if="!loadedDevice" class="name-placeholder"
          >loading device name</span
        >
        <span v-else>
          <span>{{
            (device && device.devicename) || $route.params.devicename
          }}</span>
        </span>
      </h1>
      <p class="lead">Manage this device.</p>
    </b-jumbotron>

    <spinner :fetching="!loadedDevice" />
    <div v-if="loadedDevice && device">
      <device-detail
        :device="device"
        :user="currentUser"
        :software="softwareDetails"
        class="dev-details"
      />
    </div>
  </b-container>
</template>

<script>
import { mapState } from "vuex";
import DeviceDetail from "../components/Devices/DeviceDetail.vue";
import Spinner from "../components/Spinner.vue";
import api from "../api/index";

// FIXME(jon): Should we even have this view anymore, or should all devices have to be part of a group?
// In theory this view breaks if the user has access to multiple devices with the same name, which is allowed.

export default {
  name: "DeviceView",
  components: { DeviceDetail, Spinner },
  computed: mapState({
    currentUser: (state) => state.User.userData,
  }),
  data() {
    return {
      loadedDevice: false,
      device: {},
      softwareDetails: { message: "Retrieving version information..." },
    };
  },
  watch: {
    $route() {
      this.queryDevice();
    },
  },
  created() {
    this.queryDevice();
  },
  methods: {
    queryDevice: async function () {
      this.loadedDevice = false;
      try {
        await this.fetchDevice();
        await this.getSoftwareDetails(this.device.id);
      } catch (e) {
        // TODO - we will move away from global error handling, and show any errors locally in the component
      }
      this.loadedDevice = true;
    },
    fetchDevice: async function () {
      const {
        result: {
          devices: { rows: devices },
        },
      } = await api.device.getDevice(this.$route.params.devicename);
      this.devices = devices;
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
</style>
