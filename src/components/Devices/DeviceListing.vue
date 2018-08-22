<template>
  <b-col>
    <div
      v-for="(device, index) in devices.rows"
      :key="index"
      class="device">
      <div class="header">
        <h4>{{ device.devicename }}</h4>

        <font-awesome-icon
          :icon="openCloseIcon(device.devicename !== currentDevice.devicename)"
          class="show-button"
          size="2x"
          style="cursor: pointer;"
          @click="showDeviceDetail(device.devicename)"/>
      </div>

      <device-detail v-if="device.devicename === currentDevice.devicename"/>

    </div>
  </b-col>
</template>

<script>

import {mapState} from 'vuex';
import DeviceDetail from './DeviceDetail.vue';

export default {
  name: "DevicesListing",
  components: {DeviceDetail},
  data() {
    return {
      devicesTableFields: [
        {key: 'devicename', label: 'Devices'},
      ]
    };
  },
  computed: mapState({
    devices: state => state.Devices.devices,
    currentDevice: state => state.Devices.currentDevice,
  }),
  methods: {
    openCloseIcon(isClosed) {
      return isClosed ? ['far','caret-square-down'] : ['far','caret-square-up'];
    },
    showDeviceDetail(devicename) {
      this.$store.dispatch('Devices/GET_DEVICE', devicename);
    }
  }
};
</script>

<style scoped>

  h4 {
    margin-top: 0.75rem;
    font-size: 1rem;
  }

  .show-button {
    display: flex;
    margin-left: auto;

  }

  .device {
    padding: 0.75rem;
    border-top: 1px solid #dee2e6;
    display: flex;
    flex-direction: column;
  }

  .device:nth-child(odd) {
    background: rgba(0, 0, 0, 0.05);
  }

  .header {
    display: flex;
  }
</style>
