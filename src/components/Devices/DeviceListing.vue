<template>
  <div>
    <div
      v-for="(device, index) in devices"
      :key="index"
      class="device">
      <div class="header">
        <h4>{{ device.devicename }}</h4>

        <b-link
          :to="{ name: 'device', params: { devicename: device.devicename }}"
          class="show-button">
          <font-awesome-icon
            :icon="['far', 'caret-square-right']"
            size="2x"
            style="cursor: pointer;"/>
        </b-link>
      </div>
    </div>
  </div>
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
    devices: state => state.Devices.devices
  })
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

  .header {
    display: flex;
  }
</style>
