<template>
  <a
    :href="`/recording//${item.recID}/${item.trackID}`"
    class="event-summary row"
    @click="navigateToRecording(item)"
  >
    <b-col class="track-title">
      <span>Track </span>
      {{ trackNumber }}
    </b-col>
    <b-col>
      {{ item.start.format("LT") }}
    </b-col>
    <b-col>
      {{ item.confidence }}
      <span> %</span>
    </b-col>
    <b-col>
      <div v-if="item.wasUnidentified">
        <span>
          Unidentified
        </span>
      </div>
    </b-col>
  </a>
</template>

<script lang="ts">
import { VisitEvent } from "../visits";
export default {
  name: "EventSummary",
  props: {
    trackNumber: {
      type: Number,
      required: true
    },
    item: {
      type: Object,
      required: true
    }
  },
  methods: {
    navigateToRecording(visEvent: VisitEvent) {
      this.$router.push({
        path: `recording/${visEvent.recID}/${visEvent.trackID}`
      });
    }
  }
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
  background-color: rgba(0, 0, 0, 0.03);
  margin-left: 1em;
  margin-right: 1em;
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
