<template>
  <a
    :href="`/recording/${item.recID}/${item.trackID}?device=${this.deviceId}`"
    class="event-summary row no-gutters"
    @click="(event) => navigateToRecording(event, item)"
  >
    <b-col class="track-title" cols="5">
      <span>Track </span>
      {{ trackNumber }}
    </b-col>
    <b-col cols="3">
      {{ formatDate(item.start, "LTS") }}
    </b-col>
    <b-col>
      <div v-if="item.confidence != 0">
        {{ item.confidence }}
        <span> %</span>
      </div>
    </b-col>
    <b-col>
      {{ capitalizeFirst(item.what) }}
    </b-col>
  </a>
</template>

<script lang="ts">
import * as moment from "moment";
import { VisitEvent } from "../api/visits";
export default {
  name: "EventSummary",
  props: {
    trackNumber: {
      type: Number,
      required: true,
    },
    item: {
      type: Object,
      required: true,
    },
    deviceId: {
      type: Number,
      required: true,
    },
  },
  methods: {
    formatDate(date: string, formatStr: string): string {
      return moment(date).format(formatStr);
    },
    capitalizeFirst(value: string) {
      if (value) {
        return value.charAt(0).toUpperCase() + value.substring(1);
      } else {
        return "Nothing";
      }
    },
    navigateToRecording(event, visEvent: VisitEvent) {
      if (!(event.metaKey || event.ctrlKey || event.shiftKey)) {
        this.$router.push({
          path: `recording/${visEvent.recID}/${visEvent.trackID}?device=${this.deviceId}`,
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.track-title {
  font-weight: 600;
}

.event-summary {
  width: 100%;
  background-color: #b7d2ef;
  padding: 0.5em;
  cursor: pointer;
  transition: box-shadow 0.2s;
  color: unset;
  div {
    color: inherit;
  }
  &:hover {
    box-shadow: 0 1px 3px $gray-400;
    text-decoration: unset;
  }
}
</style>
