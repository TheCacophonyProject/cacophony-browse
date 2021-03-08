<template>
  <div class="container">
    <b-row>
      <b-col class="col-12 col-lg-7">
        <device-users :device="device" :user="user" />
        <hr />
        <device-software :software="software" />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapState } from "vuex";
import DeviceUsers from "./DeviceUsers.vue";
import DeviceSoftware from "./DeviceSoftware.vue";

export default {
  name: "DeviceDetail",
  components: { DeviceUsers, DeviceSoftware },
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
};
</script>
<style scoped>
hr {
  margin-top: 2em;
  width: 60%;
}
</style>
