<template>
  <b-container>
    <h1>Devices</h1>
    <device-listing :devices="devices" />
  </b-container>
</template>

<script>

import {mapState} from 'vuex';
import DeviceListing from '../components/Devices/DeviceListing.vue';

export default {
  name: 'DevicesView',
  components: { DeviceListing },
  props: {},
  computed:
    mapState({
      devices: state => state.Devices.devices
    }),
  watch: {
    '$route' () {
      this.fetchDevices();
    }
  },
  created: function () {
    this.fetchDevices();
  },
  methods: {
    fetchDevices: function () {
      this.$store.dispatch('Devices/GET_DEVICES');
    }
  }
};
</script>
