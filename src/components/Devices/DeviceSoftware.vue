<template>
  <div :class="'versions'">
    <h2>Current software versions</h2>
    <div v-if="!software.result">Message: {{ software.message }}</div>
    <div
      v-if="
        software.result &&
        software.result.EventDetail &&
        software.result.EventDetail.details
      "
    >
      <div
        v-for="(version, component) in software.result.EventDetail
          .details"
        :key="component"
      >
        <b>{{ component }}</b
        >: {{ version }}
      </div>
      <div v-if="software.result.dateTime">
        <i
          >Recorded {{ dayOfSnapshot.toLowerCase() }} at
          {{ timeOfSnapshot }}</i
        >
      </div>
      <p>
        Current released software versions are listed
        <a
          href="https://github.com/TheCacophonyProject/saltops#branch-prod"
          >here</a
        >.
      </p>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { toStringTodayYesterdayOrDate } from "../../helpers/datetime";

export default {
  name: "DeviceDetail",
  props: {
    software: {
      type: Object,
      required: true,
    },
  },
  computed: mapState({
    dayOfSnapshot: function () {
      if (this.software.result.dateTime) {
        return toStringTodayYesterdayOrDate(
          new Date(this.software.result.dateTime)
        );
      }
    },
    timeOfSnapshot: function () {
      if (this.software.result.dateTime) {
        const thisDate = new Date(this.software.result.dateTime);
        return thisDate.toLocaleTimeString();
      }
    },
  }),
};
</script>
<style scoped>
.versions {
  padding-top: 1em;
}

.versions p {
  padding-top: 1em;
}
</style>
