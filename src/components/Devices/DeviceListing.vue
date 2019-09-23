<template>
  <div>
    <spinner :fetching="!fetched" />

    <p v-if="!devices.length && fetched">You currently have no devices.</p>

    <div
      v-for="(device, index) in orderedDevices"
      :key="index"
      :class="fetchable()"
      class="device"
    >
      <router-link
        :to="{ name: 'device', params: { devicename: device.devicename } }"
        tag="div"
        class="header"
      >
        <h4>{{ device.devicename }}</h4>

        <icon-link
          :icon="['fas', 'angle-right']"
          :link="{ name: 'device', params: { devicename: device.devicename } }"
          :position="'right'"
        />
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Spinner from "../Spinner.vue";
import IconLink from "../IconLink.vue";

export default {
  name: "DevicesListing",
  components: { Spinner, IconLink },
  data() {
    return {
      devicesTableFields: [{ key: "devicename", label: "Devices" }]
    };
  },
  computed: mapState({
    fetched: state => state.Devices.fetched,
    devices: state => state.Devices.devices,
    orderedDevices: function() {
      return this.devices.sort((a, b) =>
        a.devicename.localeCompare(b.devicename)
      );
    }
  }),
  methods: {
    fetchable() {
      return this.fetched ? "fetched" : "fetching";
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
