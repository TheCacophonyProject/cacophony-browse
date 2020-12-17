<template>
  <b-container fluid class="admin">
    <b-jumbotron class="jumbotron-admin" fluid>
      <h1>Your Devices</h1>
      <p class="lead">These are your bird monitors and/or thermal cameras.</p>
    </b-jumbotron>
    <device-listing :devices="devices" />
  </b-container>
</template>

<script>
import { mapState } from "vuex";
import DeviceListing from "../components/Devices/DeviceListing.vue";

export default {
  name: "DevicesView",
  components: { DeviceListing },
  props: {},
  computed: mapState({
    devices: (state) => state.Devices.devices,
  }),
  watch: {
    $route() {
      this.fetchDevices();
    },
  },
  created: function () {
    this.fetchDevices();
  },
  methods: {
    fetchDevices: function () {
      this.$store.dispatch("Devices/GET_DEVICES");
    },
  },
};
</script>
