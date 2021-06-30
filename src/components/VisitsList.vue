<template>
  <div :class="['results']" ref="list-container">
    <div>
      <div
        v-for="(itemsByDay, index_a) in visitsChunkedByDayAndHour"
        :key="index_a"
        :ref="`day_${index_a}`"
        class="day-wrapper"
      >
        <h4
          class="recordings-day"
          @click="() => toggleVisitDayVisibility(index_a)"
        >
          <img
            v-for="(item, i) in visitClasses(itemsByDay)"
            :key="i"
            :class="['summary-image', item]"
            :src="imgSrc(item)"
            width="24"
            height="auto"
            :alt="item"
            onerror="this.src='data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='"
          />
          <span v-html="relativeDay(itemsByDay)" />
        </h4>
        <div v-if="expandedDays[index_a]">
          <div
            v-for="(itemsByHour, index_b) in reverse(itemsByDay)"
            :key="index_b"
          >
            <h5 class="recordings-hour">{{ hourRange(itemsByHour) }}</h5>
            <VisitSummary
              v-for="(item, index) in reverse(itemsByHour)"
              :key="`${index}_card_a`"
              :item="item"
              :future-search-query="viewVisitsQuery"
            />
          </div>
        </div>
      </div>
      <div v-if="queryPending" class="results loading">
        <div
          v-for="i in 10"
          :style="{
            background: `rgba(240, 240, 240, ${1 / i}`,
          }"
          :key="i"
          class="recording-placeholder"
        />
      </div>
    </div>
    <div v-if="allLoaded || atEnd" class="all-loaded">
      <span>That's all! No more visits to load for the current query.</span>
    </div>
  </div>
</template>

<script lang="ts">
import {
  startOfHour,
  startOfEvening,
  toStringTodayYesterdayOrDateInNights,
} from "@/helpers/datetime";
import { NewVisit } from "@/api/Monitoring.api";
import VisitSummary from "@/components/VisitSummary.vue";
import { imgSrc } from "@/const";

interface ItemData {
  kind: "dataRow" | "dataSeparator" | "noActivity" | "powerEvent" | "duskDawn";
  name: string;
  fromDate: Date;
  toDate: Date;
  time: string;
  item: NewVisit;
}

interface VisitsListData {
  visitsChunkedByDayAndHour: Array<Array<ItemData[]>>;
  expandedDays: Record<number, boolean>;
  atEnd: boolean;
  loadedVisitsCount: number;
}

// NOTE: Sorting precedence for visit tags displayed as small summary icons
const tagPrecedence = [
  "unidentified",
  "none",
  "mustelid",
  "cat",
  "possum",
  "hedgehog",
  "rodent",
  "leporidae",
];

export default {
  name: "VisitsList",
  components: {
    VisitSummary,
  },
  props: {
    visits: {
      type: Array,
      required: true,
    },
    queryPending: {
      type: Boolean,
      required: true,
    },
    viewVisitsQuery: {
      type: Object,
      default: () => ({}),
    },
    allLoaded: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    visits() {
      // TODO(jon): Chunk this by "night" of recording, so that I can easily see what happened in
      //  the previous night from dusk till dawn.
      // For each day, have a summary of species at the top.
      // Keep lazy loading until we have each day, so that we can display proper summaries for each day.

      // Should I show periods of "no activity"? Yes, I think that makes things clearer.

      let prevFromDate = null;
      let prevDate = null;
      const visits = this.visits as NewVisit[];
      if (visits.length === 0) {
        this.visitsChunkedByDayAndHour = [];
        this.loadedRecordingsCount = 0;
        return;
      }
      // Slice from last recordings count, so we're only processing new recordings.
      const newVisits = visits.slice(this.loadedVisitsCount);
      this.loadedVisitsCount = this.visits.length;
      const items = [];

      // TODO(jon): Intersperse power-on/power-off events and dusk/dawn times

      for (const visit of newVisits) {
        const fromDate = new Date(visit.timeStart);
        const toDate = new Date(visit.timeEnd);
        if (
          prevFromDate === null ||
          startOfEvening(fromDate).getTime() !==
            startOfEvening(prevFromDate).getTime()
        ) {
          const item = {
            kind: "dataSeparator",
            hour: fromDate,
            date: fromDate,
          };
          items.push(item);
          prevFromDate = fromDate;
        } else if (
          startOfHour(fromDate).getTime() !==
          startOfHour(prevFromDate).getTime()
        ) {
          const item = {
            kind: "dataSeparator",
            hour: fromDate,
          };
          items.push(item);
          prevFromDate = fromDate;
        }

        if (
          prevDate &&
          Math.abs(prevDate.getTime() - toDate.getTime()) < 1000 * 60 * 60 * 8
        ) {
          // Push "no activity block" if less than 8 eight hours of inactivity
          items.push({
            kind: "noActivity",
            name:
              visit.classification === "powered-off"
                ? "powered down"
                : "no activity",
            fromDate: toDate,
            toDate: prevDate,
            time: toDate.toLocaleTimeString(),
            item: { recordings: [] },
          });
        }
        const powerEvents = [
          "rpi-power-on",
          "powered-off",
          "daytime-power-off",
        ];
        const duskDawn = ["Sunset", "Sunrise"];
        const itemData: ItemData = {
          kind: powerEvents.includes(visit.classification)
            ? "powerEvent"
            : duskDawn.includes(visit.classification)
            ? "duskDawn"
            : "dataRow",
          name: visit.classification,
          fromDate,
          toDate,
          time: fromDate.toLocaleTimeString(),
          item: visit,
        };
        prevDate = fromDate;
        items.push(itemData);
      }
      // Now calculate chunks of days and hour groupings
      {
        const chunks = [];
        let current = chunks;
        for (const item of items) {
          if (item.kind === "dataSeparator") {
            if (item.hasOwnProperty("date")) {
              chunks.push([]);
              current = chunks[chunks.length - 1];
            }
            if (item.hasOwnProperty("hour")) {
              current.push([]);
            }
          } else {
            current[current.length - 1].push(item);
          }
        }
        if (chunks.length === 0) {
          // We've reached the end of the recordings.
          this.atEnd = true;
          console.log("At end of visits");
        }
        if (
          this.visitsChunkedByDayAndHour.length !== 0 &&
          chunks.length !== 0
        ) {
          // We need to be careful joining these here:
          const lastDay =
            this.visitsChunkedByDayAndHour[
              this.visitsChunkedByDayAndHour.length - 1
            ];
          const lastHour =
            lastDay[lastDay.length - 1][lastDay[lastDay.length - 1].length - 1];
          const firstDay = chunks[0];
          const firstHour = firstDay[0][0];

          if (lastHour.date === firstHour.date) {
            // We're going to push firstDay into lastDay
            if (lastHour.time.split(":")[0] === firstHour.time.split(":")[0]) {
              lastDay[lastDay.length - 1].push(...firstDay[0]);
              lastDay.push(...firstDay.slice(1));
            } else {
              lastDay.push(...firstDay);
            }
            this.visitsChunkedByDayAndHour.push(...chunks.slice(1));
          } else {
            this.visitsChunkedByDayAndHour.push(...chunks);
          }
        } else {
          // If lastDay/Hour is the same as previous, join them.
          this.visitsChunkedByDayAndHour.push(...chunks);
        }
      }
    },
  },
  beforeDestroy() {
    this.observer && this.observer.disconnect();
  },
  beforeUpdate() {
    this.observer && this.observer.disconnect();
  },
  updated() {
    // Setup next intersection observer to see the page has scrolled enough to load more items
    this.observer = new IntersectionObserver(this.intersectionChanged);
    // Observe intersections of cards
    const maxY = [];
    // Just observe the nth to last item, and when it comes into view, we load more, and disconnect the observer.
    const n = 3;
    for (const ref of Object.values(this.$refs)) {
      if ((ref as any[]).length !== 0) {
        if (ref[0]) {
          const bounds = ref[0].getBoundingClientRect();
          maxY.push([bounds.y, ref[0]]);
          maxY.sort((a, b) => b[0] - a[0]);
          if (maxY.length > n) {
            maxY.pop();
          }
        }
      }
    }
    if (maxY.length) {
      const observerTrigger = maxY[maxY.length - 1][1];
      this.$refs["list-container"].style.height = `${maxY[0][0]}px`;
      this.observer && this.observer.observe(observerTrigger);
    }
  },
  methods: {
    imgSrc(what: string) {
      if (what === "none" || what === "conflicting tags") {
        return imgSrc("unidentified");
      }
      return imgSrc(what);
    },
    intersectionChanged(entries: IntersectionObserverEntry[]) {
      for (const intersectionEvent of entries) {
        if (intersectionEvent.isIntersecting) {
          this.observer.unobserve(intersectionEvent.target);
          this.$emit("load-more");
        }
      }
    },
    relativeDay(dayChunk: Array<ItemData[]>) {
      const fromDate = dayChunk[0][0].fromDate;
      const toDate = new Date(fromDate.getTime());
      toDate.setDate(toDate.getDate() - 1);
      return toStringTodayYesterdayOrDateInNights(fromDate, toDate);
    },
    visitClasses(dayChunk: Array<ItemData[]>): string[] {
      return dayChunk
        .reduce((acc: string[], hourChunk: ItemData[]) => {
          for (const item of hourChunk) {
            if (item.kind === "dataRow") {
              acc.push(item.name);
            }
          }
          return acc;
        }, [])
        .map((item) => ({ name: item, priority: tagPrecedence.indexOf(item) }))
        .sort((a, b) => {
          if (a.priority === -1 && b.priority > -1) {
            return -1;
          } else if (b.priority === -1 && a.priority > -1) {
            return 1;
          } else if (a.priority === -1 && b.priority === -1) {
            if (a.name === b.name) {
              return 0;
            }
            return a.name > b.name ? 1 : -1;
          }
          return b.priority - a.priority;
        })
        .map(({ name }) => name);
    },
    reverse(arr) {
      return [...arr].reverse();
    },
    toggleVisitDayVisibility(index: number) {
      if (!this.expandedDays.hasOwnProperty(index)) {
        this.$set(this.expandedDays, index, true);
      } else {
        this.$delete(this.expandedDays, index);
      }
    },
    hourRange(hourChunk: ItemData[]) {
      const fromDate = hourChunk.length && hourChunk[0].fromDate;
      const fromHours = fromDate && fromDate.getHours();
      let toHoursString;
      let fromHoursString;
      if (fromHours === 0) {
        fromHoursString = "12am";
      } else {
        fromHoursString = `${fromHours <= 12 ? fromHours : fromHours - 12}${
          fromHours < 12 ? "am" : "pm"
        }`;
      }

      const toDate =
        hourChunk.length && hourChunk[hourChunk.length - 1].fromDate;
      const toHours = toDate && toDate.getHours();
      if (toHours === 0) {
        toHoursString = "12am";
      } else {
        toHoursString = `${toHours <= 12 ? toHours : toHours - 12}${
          toHours < 12 ? "am" : "pm"
        }`;
      }

      if (fromHours === toHours) {
        return fromHoursString;
      } else {
        return `${toHoursString} - ${fromHoursString}`;
      }
    },
  },
  data(): VisitsListData {
    return {
      visitsChunkedByDayAndHour: [],
      expandedDays: {},
      atEnd: false,
      loadedVisitsCount: 0,
    };
  },
};
</script>

<style scoped lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.recordings-day {
  position: sticky;
  cursor: pointer;
  top: 0;
  > img {
    margin-top: 0.5rem;
  }
  > span {
    display: block;
    width: 100%;
    background: transparentize($white, 0.15);
    padding: 0.5rem 0 0.5rem 10px;
    border-bottom: 1px solid $gray-200;
  }
  font-size: 1em;
  font-weight: 600;
  border-left: 2px dashed gray;
  padding-bottom: 10px;
  margin-bottom: 0;
}

.recordings-hour {
  font-size: 0.9em;
  font-weight: 600;
}

@include media-breakpoint-down(md) {
  .recordings-hour {
    position: sticky;
    top: 0;
    right: 0;
    text-align: right;
    margin-top: -1rem;
    margin-bottom: 0;
    padding: 0.7rem 0;
  }
  .recordings-day + div .recordings-hour {
    margin-top: -2.8rem;
    margin-bottom: 11px;
  }
}

@include media-breakpoint-up(md) {
  .recordings-hour {
    display: inline-block;
    min-width: 100px;
    position: sticky;
    float: left;
    top: 40px;
    text-align: right;
    margin-left: -110px;
    margin-top: 15px;
  }
}

.recording-placeholder {
  height: 110px;
  margin-bottom: 15px;
}

.results {
  max-width: 640px;
}

.results.display-rows {
  overflow-x: auto;
  //overflow-y: unset;
  max-width: unset;

  .results-rows {
    display: table-row-group;
  }
  .all-rows {
    display: table;
    width: 100%;
    border-top: 1px solid $border-color;
    border-left: 1px solid $border-color;
  }

  .results-header {
    margin-bottom: 0;
    display: table-header-group;
    > div {
      display: table-row;

      > span {
        position: sticky;
        top: 0;
        background: transparentize($white, 0.15);
        padding: 5px;
        font-weight: 700;
        vertical-align: middle;
        display: table-cell;
        border-right: 1px solid $border-color;
        border-bottom: 2px solid $border-color;
      }
    }
  }
}
// Row view variant
.recording-summary-row {
  width: 100%;
  &:nth-child(odd) {
    background-color: #eee;
  }
  border-top: 1px solid $border-color;
  display: table-row;
  > * {
    display: table-cell;
    vertical-align: middle;
    padding: 5px;
    border-right: 1px solid $border-color;
    &:last-child {
      padding-right: 5px;
    }
  }
}
.all-loaded {
  text-align: center;
  padding-top: 20px;
  padding-bottom: 30px;
  color: #aaa;
  > span {
    padding: 5px 10px;
    border-radius: 15px;
    background: $gray-100;
    font-weight: bold;
  }
}
.day-wrapper {
  //min-height: 100px;
}
.day-wrapper > div:last-of-type > div {
  padding-bottom: 10px;
}
.summary-image {
  float: right;
}
</style>
