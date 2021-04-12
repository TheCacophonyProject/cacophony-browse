<template>
  <b-container>
    <b-tabs
      card
      class="device-tabs"
      nav-class="device-tabs-container container"
      v-model="currentTabIndex"
    >
      <b-tab title="Current Software">
        <DeviceSoftware :software="software" />
      </b-tab>
      <b-tab title="Users">
        <template #title>
          <TabTemplate
            title="Users"
            :isLoading="!device"
            :value="device && device.Users ? device.Users.length : 0"
          />
        </template>
        <DeviceUsers 
          :device="device" 
          :user="user"
          @reload-device="$emit('reload-device')"/>
      </b-tab>
      <b-tab title="All Events">
        <DeviceEvents :device="device" />
      </b-tab>
    </b-tabs>
  </b-container>
</template>

<script>
import DeviceUsers from "./DeviceUsers.vue";
import DeviceSoftware from "./DeviceSoftware.vue";
import DeviceEvents from "./DeviceEvents.vue";
import TabTemplate from "@/components/TabTemplate.vue";

export default {
  name: "DeviceDetail",
  components: { DeviceUsers, DeviceSoftware, DeviceEvents, TabTemplate },
  props: {
    device: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
    software: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      currentTabIndex: 0,
    };
  },
};
</script>
<style lang="scss">
.device-tabs {
  .card-header {
    // Same color as the jumbotron component abutting above the tabs.
    background-color: #f8f9fa;
    .card-header-tabs {
      margin-left: auto;
      margin-right: auto;
    }
  }
}
</style>
