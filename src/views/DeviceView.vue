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
        <span v-if="!fetched" class="name-placeholder"
          >loading device name</span
        >
        <span v-else>
          <span>{{ device && device.devicename }}</span>
        </span>
      </h1>
      <p class="lead">Manage this device.</p>
    </b-jumbotron>

    <spinner :fetching="!fetched" />
    <div v-if="device && fetched">
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

export default {
  name: "DeviceView",
  components: { DeviceDetail, Spinner },
  computed: mapState({
    device: (state) => state.Devices.currentDevice,
    fetched: (state) => state.Devices.fetched,
    currentUser: (state) => state.User.userData,
  }),
  data() {
    return {
      softwareDetails: { message: "Retreiving version information..." },
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
      await this.fetchDevice();
      if (this.fetched) {
        this.getSoftwareDetails(this.device.id);
      }
    },
    fetchDevice: async function () {
      await this.$store.dispatch(
        "Devices/GET_DEVICE",
        this.$route.params.devicename
      );
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
