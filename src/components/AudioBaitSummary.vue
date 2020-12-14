<template>
  <b-row class="audio-row" no-gutters>
    <b-col cols="5">
      <span class="audio-bait">
        <font-awesome-icon icon="volume-up" size="xs" />
      </span>
      <span class="audio-title">
        {{ capitalizeFirst(item.fileName) }}
      </span>
    </b-col>
    <b-col cols="3">
      <div class="audio-time">
        {{ formatDate(item.dateTime, "LTS") }}
      </div>
    </b-col>
    <b-col cols="1">
      {{ item.EventDetail.details.volume }}
    </b-col>
  </b-row>
</template>

<script lang="ts">
import * as moment from "moment";
export default {
  name: "AudioBaitSummary",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatDate(date: string, formatStr: string): string {
      return moment(date).format(formatStr);
    },
    capitalizeFirst(value: string) {
      return value.charAt(0).toUpperCase() + value.substring(1);
    },
  },
};
</script>

<style scoped lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.audio-row {
  font-size: 0.9em;
}
.audio-title {
  font-weight: 600;
  margin-left: 10px;
}
</style>
