<template>
  <b-container>
    <header>
      <h1>Device: {{ device.devicename }}</h1>
      <icon-link
        :icon="['fas', 'angle-left']"
        :link="{ name: 'devices'}"/>
    </header>
    <spinner :fetching="!fetched" />
    <div v-if="device && fetched">
      <device-detail
        :device="device"
        :user="currentUser"
      />
    </div>
  </b-container>
</template>

<script>

import {mapState} from 'vuex';
import DeviceDetail from '../components/Devices/DeviceDetail.vue';
import Spinner from '../components/Spinner.vue';
import IconLink from '../components/IconLink.vue';

export default {
  name: 'DeviceView',
  components: {DeviceDetail, Spinner, IconLink},
  props: {},
  computed:
    mapState({
      device: state => state.Devices.currentDevice,
      fetched: state => state.Devices.fetched,
      currentUser: state => state.User.userData
    }),
  watch: {
    '$route'() {
      this.fetchDevice();
    }
  },
  created: async function () {
    await this.fetchDevice();
  },
  methods: {
    fetchDevice: async function () {
      await this.$store.dispatch('Devices/GET_DEVICE', this.$route.params.devicename);
    }
  }
};
</script>

<style scoped>
  header {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    margin: 1.5rem 0;
  }

  h1 {
    font-size: x-large;
    margin: 0;
  }
</style>
