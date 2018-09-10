<template>
  <div>

    <spinner :fetching="!fetched"/>

    <p v-if="!devices.length && fetched">You currently have no devices.</p>

    <div
      v-for="(device, index) in devices"
      :key="index"
      :class="fetchable()"
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
import Spinner from '../Spinner.vue';

export default {
  name: "DevicesListing",
  components: {DeviceDetail, Spinner},
  data() {
    return {
      devicesTableFields: [
        {key: 'devicename', label: 'Devices'},
      ]
    };
  },
  computed: mapState({
    fetched: state => state.Devices.fetched,
    devices: state => state.Devices.devices
  }),
  methods: {
    fetchable() {
      return this.fetched ? 'fetched' : 'fetching';
    }
  }
};
</script>

<style scoped>

  .fetched {
    opacity: 1;
  }

  .fetching {
    visibility: hidden;
  }

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
