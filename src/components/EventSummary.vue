<template>
  <a
    :href="`/recording/${item.recID}/${item.trackID}`"
    class="event-summary row"
    @click="event => navigateToRecording(event, item)"
  >
    <b-col class="track-title">
      <span>Track </span>
      {{ trackNumber }}
    </b-col>
    <b-col>
      {{ item.start.format("LT") }}
    </b-col>
    <b-col>
      <div v-if="item.confidence != 0">
        {{ item.confidence }}
        <span> %</span>
      </div>
    </b-col>
    <b-col>
      <span v-if="item.wasUnidentified">
        Unidentified
      </span>
      <span v-else>
        {{ capitilizeFirst(what) }}
      </span>
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
    },
    what: {
      type: String,
      required: true
    }
  },
  methods: {
    capitilizeFirst(value: string) {
      return value.charAt(0).toUpperCase() + value.substring(1);
    },
    navigateToRecording(event, visEvent: VisitEvent) {
      if (!(event.metaKey || event.ctrlKey || event.shiftKey)) {
        this.$router.push({
          path: `recording/${visEvent.recID}/${visEvent.trackID}`
        });
      }
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
