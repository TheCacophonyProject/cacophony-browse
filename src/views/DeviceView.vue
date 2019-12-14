<template>
  <b-container fluid class="admin">
    <b-jumbotron class="jumbotron" fluid>
      <div>
        <b-link
          class="back-link"
          :to="{
            name: 'devices'
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
      <p class="lead">Manage the users associated with this device.</p>
    </b-jumbotron>

    <spinner :fetching="!fetched" />
    <div v-if="device && fetched">
      <device-detail :device="device" :user="currentUser" />
    </div>
  </b-container>
</template>

<script>
import { mapState } from "vuex";
import DeviceDetail from "../components/Devices/DeviceDetail.vue";
import Spinner from "../components/Spinner.vue";

export default {
  name: "DeviceView",
  components: { DeviceDetail, Spinner },
  props: {},
  computed: mapState({
    device: state => state.Devices.currentDevice,
    fetched: state => state.Devices.fetched,
    currentUser: state => state.User.userData
  }),
  watch: {
    $route() {
      this.fetchDevice();
    }
  },
  created: async function() {
    await this.fetchDevice();
  },
  methods: {
    fetchDevice: async function() {
      await this.$store.dispatch(
        "Devices/GET_DEVICE",
        this.$route.params.devicename
      );
    }
  }
};
</script>
