<template>
  <b-container>
    <b-row v-if="!fetched">
      <spinner />
    </b-row>
    <b-row v-else>
      <b-col v-if="!devices.length" class="col-12 col-lg-8">
        <b-card class="no-content-placeholder">
          <!-- TODO: expand the message to explain why -->
          <p>You currently have no devices.</p>
        </b-card>
      </b-col>
      <b-col v-else class="col-12 col-lg-8">
        <div class="list-wrapper">
          <router-link
            v-for="(device, index) in orderedDevices"
            :key="index"
            :to="{ name: 'device', params: { devicename: device.devicename } }"
            class="list-group-item list-group-item-action"
          >
            {{ device.devicename }}
            <font-awesome-icon class="icon" icon="chevron-right" size="xs" />
          </router-link>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapState } from "vuex";
import Spinner from "../Spinner.vue";

export default {
  name: "DevicesListing",
  components: { Spinner },
  data() {
    return {
      devicesTableFields: [{ key: "devicename", label: "Devices" }],
    };
  },
  computed: mapState({
    fetched: (state) => state.Devices.fetched,
    devices: (state) => state.Devices.devices,
    orderedDevices: function () {
      return this.devices.sort((a, b) =>
        a.devicename.localeCompare(b.devicename)
      );
    },
  }),
};
</script>
