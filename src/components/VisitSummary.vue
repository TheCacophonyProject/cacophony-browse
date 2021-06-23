<template>
  <div
    :class="[
      'visit-item',
      { 'small-gap': smallGapOfInactivity },
      { 'big-gap': !smallGapOfInactivity },
    ]"
    v-if="item.kind === 'noActivity'"
  >
    <span>
      <font-awesome-icon :icon="['far', 'clock']" size="xs" />
      {{ visitLength }}
    </span>
    <span>, {{ item.name }}</span>
  </div>
  <div v-else class="visit-item visit">
    <div>
      <div>
        <img
          :src="imgSrc"
          onerror="this.src='data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='"
          width="48"
          height="auto"
          :alt="item.name"
        />
      </div>
      <div>
        <span>
          {{ item.name }}
        </span>
        <span>{{ item.item.recordings.length }}</span>
        <div>
          <span>
            <font-awesome-icon :icon="['far', 'clock']" size="xs" />
            over a period of {{ visitLength }}
          </span>
        </div>
      </div>
    </div>
    <!--    <span>{{ item.item.timeStart }}</span>-->
    <!--    <span>{{ item.item.timeEnd }}</span>-->
  </div>
</template>

<script lang="ts">
import { imgSrc } from "@/const";

const timeElapsed = (start: Date, end: Date): string => {
  const seconds = (end.getTime() - start.getTime()) / 1000;
  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`;
  } else if (seconds < 60 * 60) {
    return `${Math.round(seconds / 60)} minutes`;
  } else if (seconds < 60 * 60 * 60) {
    return `${(seconds / 60 / 60).toFixed(2)} hours`;
  }
  return seconds.toString();
};

export default {
  name: "VisitSummary",
  props: {
    item: {
      type: Object,
      required: true,
    },
    futureSearchQuery: {
      type: Object,
      required: true,
    },
  },
  computed: {
    imgSrc() {
      if (this.item.name === "none") {
        return imgSrc("unidentified");
      }
      return imgSrc(this.item.name);
    },
    visitLength(): string {
      return timeElapsed(this.item.fromDate, this.item.toDate);
    },
    smallGapOfInactivity(): boolean {
      return (
        Math.abs(this.item.fromDate.getTime() - this.item.toDate.getTime()) <
        1000 * 60 * 16
      );
    },
  },
};
</script>

<style scoped lang="scss">
.visit-item {
  min-height: 50px;
  width: 100%;
  display: flex;
  align-items: center;
  > div {
    display: flex;
    align-items: center;
  }
  > .over-period {
    padding-left: 63px;
  }
  &.visit {
    border-left: 2px solid gray;
    padding-left: 30px;
  }
  &.visit::before {
    top: 24px;
    content: "";
    width: 30px;
    height: 2px;
    background: gray;
    display: inline-block;
    margin-left: -30px;
  }
  img {
    display: inline-block;
    background: #aaa;
    border-radius: 50%;
    padding: 5px;
    //filter: invert(1);
    // TODO(jon): Make all our predator icons SVGs, so that we can easily change the colour.
    margin-right: 15px;
  }
  //outline: 1px solid red;
  &.small-gap,
  &.big-gap {
    &::before {
      content: "";
      height: 0;
      border-top: 2px dashed gray;
      display: inline-block;
      padding-left: 120px;
      margin-right: 10px;
    }
    border-left: 2px dashed gray;
  }
  &.small-gap {
    min-height: 30px;
    &::before {
      padding-left: 300px;
    }
  }
  &.big-gap {
    min-height: 60px;
    &::before {
      padding-left: 400px;
    }
  }
}
</style>
