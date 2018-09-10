<template>
  <b-container>
    <h2>Device</h2>
    <spinner :fetching="!fetched" />
    <div v-if="device && fetched">
      <header>
        <h1>{{ device.devicename }}</h1>
        <b-link
          class="hide-button"
          @click="back()">
          <font-awesome-icon
            :icon="['far', 'window-close']"
            size="2x"
            style="cursor: pointer;"/>
        </b-link>
      </header>
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

export default {
  name: 'DeviceView',
  components: {DeviceDetail, Spinner},
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
    },
    back: function () {
      this.$router.history.go(-1);
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
    font-size: large;
    margin: 0;
  }

  h2 {
    font-size: x-large;
    margin: 1.5rem 0;
  }
</style>
