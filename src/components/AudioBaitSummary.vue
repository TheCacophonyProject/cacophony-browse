<template>
  <b-row class="audio-row" no-gutters>
    <span>
      <font-awesome-icon icon="volume-up" size="xs" />
    </span>
    <div class="audio-title">
      {{ capitilizeFirst(item.fileName) }}
    </div>
    <div class="audio-time">
      {{ formatDate(item.dateTime, "LTS") }}
    </div>
  </b-row>
</template>

<script lang="ts">
import * as moment from "moment";
export default {
  name: "AudioBaitSummary",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDate(date: string, formatStr: string): string {
      return moment(date).format(formatStr);
    },
    capitilizeFirst(value: string) {
      return value.charAt(0).toUpperCase() + value.substring(1);
    }
  }
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
.audio-time {
  margin-left: 20px;
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
