<template>
  <div
    v-if="!queryPending"
    :class="['results', { 'display-rows': !showCards }]"
  >
    <div v-if="showCards">
      <div
        v-for="(itemsByDay, index_a) in recordingsChunkedByDayAndHour"
        :key="index_a"
      >
        <h4 class="recordings-day">{{ relativeDay(itemsByDay) }}</h4>
        <div v-for="(itemsByHour, index_b) in itemsByDay" :key="index_b">
          <h5 class="recordings-hour">{{ hour(itemsByHour) }}</h5>
          <RecordingSummary
            v-for="(item, index) in itemsByHour"
            :item="item"
            :key="`${index}_card`"
            :futureSearchQuery="viewRecordingQuery"
            display-style="card"
          />
        </div>
      </div>
    </div>
    <div v-else-if="tableItems && tableItems.length !== 0" class="all-rows">
      <div class="results-header">
        <div>
          <span>ID</span>
          <span>Type</span>
          <span>Device</span>
          <span>Date</span>
          <span>Time</span>
          <span>Duration</span>
          <span>Tags</span>
          <span>Group</span>
          <span>Location</span>
          <span>Battery</span>
        </div>
      </div>
      <div class="results-rows">
        <RecordingSummary
          v-for="(item, index) in tableItems"
          :item="item"
          :is-even-row="index % 2 === 1"
          :key="`${index}_row`"
          display-style="row"
          :futureSearchQuery="viewRecordingQuery"
        />
      </div>
    </div>
  </div>
  <div v-else class="results loading">
    <div
      v-for="i in 10"
      :style="{
        background: `rgba(240, 240, 240, ${1 / i}`,
      }"
      :key="i"
      class="recording-placeholder"
    />
  </div>
</template>

<script lang="ts">
import {
  Location,
  Recording,
  RecordingInfo,
  RecordingType,
  Tag,
  Track,
  TrackTag,
} from "@/api/Recording.api";
import RecordingSummary from "@/components/RecordingSummary.vue";
import {
  toNZDateString,
  startOfDay,
  startOfHour,
  toStringTodayYesterdayOrDate,
} from "@/helpers/datetime";

const parseLocation = (location: Location): string => {
  if (location && typeof location === "object") {
    const latitude = location.coordinates[0];
    const longitude = location.coordinates[1];
    return latitude + ", " + longitude;
  } else {
    return "(unknown)";
  }
};

const parseProcessingState = (result: string): string => {
  const string = result.toLowerCase();
  return string.charAt(0).toUpperCase() + string.slice(1);
};

interface IntermediateDisplayTag {
  taggerIds: number[];
  automatic: boolean;
  human: boolean;
}

interface DisplayTag {
  taggerIds: number[];
  automatic: boolean;
  class: "human" | "automatic" | "automatic human";
  human: boolean;
  order: number;
}

const addToListOfTags = (
  allTags: Record<string, IntermediateDisplayTag>,
  tagName: string,
  isAutomatic: boolean,
  taggerId: number | null
) => {
  const tag = allTags[tagName] || {
    taggerIds: [],
    automatic: false,
    human: false,
  };
  if (taggerId && !tag.taggerIds.includes(taggerId)) {
    tag.taggerIds.push(taggerId);
  }
  if (isAutomatic) {
    tag.automatic = true;
  } else {
    tag.human = true;
  }
  allTags[tagName] = tag;
};

const collateTags = (tags: Tag[], tracks: Track[]): DisplayTag[] => {
  // Build a collection of tagItems - one per animal
  const tagItems: Record<string, DisplayTag> = {};
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    const tagName = tag.animal === null ? tag.event : tag.animal;
    const taggerId = tag.taggerId;
    addToListOfTags(tagItems, tagName, tag.automatic, taggerId);
  }

  if (tracks) {
    for (let j = 0; j < tracks.length; j++) {
      const track = tracks[j];
      // For track tags, pick the best one, which is the "master AI" tag.
      const aiTag: TrackTag = track.TrackTags.find(
        (tag) =>
          tag.data &&
          (tag.data === "Master" ||
            (typeof tag.data === "object" && tag.data.name === "Master"))
      );
      const humanTags = track.TrackTags.filter((tag) => !tag.automatic);
      // If the same track has one or more human tags, and none of them agree with the AI just show that:
      let humansDisagree = false;
      if (aiTag && humanTags.length !== 0) {
        humansDisagree =
          humanTags.find((tag) => tag.what === aiTag.what) === undefined;
      }

      if (aiTag && !humansDisagree) {
        addToListOfTags(tagItems, aiTag.what, aiTag.automatic, aiTag.UserId);
      }

      // Also add human tags:
      for (const tag of humanTags) {
        addToListOfTags(tagItems, tag.what, tag.automatic, tag.UserId);
      }
    }
  }

  // Use automatic and human status to create an ordered array of objects
  // suitable for parsing into coloured spans
  const result = [];
  for (let animal of Object.keys(tagItems).sort()) {
    const tagItem = tagItems[animal];
    let subOrder = 0;
    if (animal === "false positive") {
      animal = "false positive";
      subOrder = 3;
    } else if (animal === "multiple animals") {
      animal = "multiple";
      subOrder = 2;
    } else if (animal === "unidentified") {
      animal = "?";
      subOrder = 1;
    }

    if (tagItem.automatic && tagItem.human) {
      result.push({
        text: animal,
        class: "automatic human",
        taggerIds: tagItem.taggerIds,
        order: subOrder,
      });
    } else if (tagItem.human) {
      result.push({
        text: animal,
        class: "human",
        taggerIds: tagItem.taggerIds,
        order: 10 + subOrder,
      });
    } else if (tagItem.automatic) {
      result.push({
        text: animal,
        class: "automatic",
        order: 20 + subOrder,
      });
    }
  }
  // Sort the result array
  result.sort((a, b) => {
    return a.order - b.order;
  });
  return result;
};

interface ItemData {
  kind: "dataRow" | "dataSeparator";
  id: number;
  type: RecordingType;
  deviceName: string;
  groupName: string;
  stationName?: string;
  location: string;
  dateObj: Date;
  date: string;
  time: string;
  duration: number;
  tags: DisplayTag[];
  batteryLevel: number | null;
  trackCount: number;
  processingState: string;
}

export default {
  name: "RecordingsList",
  components: { RecordingSummary },
  props: {
    recordings: {
      type: Array,
      required: true,
    },
    showCards: {
      type: Boolean,
      default: true,
    },
    queryPending: {
      type: Boolean,
      required: true,
    },
    viewRecordingQuery: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    relativeDay(itemDate) {
      itemDate = itemDate[0][0].dateObj;
      return toStringTodayYesterdayOrDate(itemDate);
    },
    hour(itemDate) {
      itemDate = itemDate.length && itemDate[0].dateObj;
      const hours = itemDate && itemDate.getHours();
      if (hours === 0) {
        return "12am";
      }
      return `${hours <= 12 ? hours : hours - 12}${hours < 12 ? "am" : "pm"}`;
    },
  },
  computed: {
    recordingsChunkedByDayAndHour(): Recording[] {
      const chunks = [];
      let current = chunks;
      for (const item of this.tableItems) {
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
      return chunks;
    },
    tableItems() {
      // New day, new hour.
      const items = [];
      let prevDate = null;
      const recordings = this.recordings as RecordingInfo[];
      for (const recording of recordings) {
        const thisDate = new Date(recording.recordingDateTime);
        if (
          prevDate === null ||
          startOfDay(thisDate, true).getTime() !==
            startOfDay(prevDate, true).getTime()
        ) {
          const item = {
            kind: "dataSeparator",
            hour: thisDate,
            date: thisDate,
          };
          items.push(item);
          prevDate = thisDate;
        } else if (
          startOfHour(thisDate, true).getTime() !==
          startOfHour(prevDate, true).getTime()
        ) {
          const item = {
            kind: "dataSeparator",
            hour: thisDate,
          };
          items.push(item);
          prevDate = thisDate;
        }
        const itemData: ItemData = {
          kind: "dataRow",
          id: recording.id,
          type: recording.type,
          deviceName: recording.Device.devicename,
          groupName: recording.Group.groupname,
          location: parseLocation(recording.location),
          dateObj: thisDate,
          date: toNZDateString(thisDate),
          time: thisDate.toLocaleTimeString(),
          duration: recording.duration,
          tags: collateTags(recording.Tags, recording.Tracks),
          batteryLevel: recording.batteryLevel,
          trackCount: recording.Tracks.length,
          processingState: parseProcessingState(recording.processingState),
        };
        if (recording.Station) {
          itemData.stationName = recording.Station.name;
        }
        items.push(itemData);
      }
      return items;
    },
  },
};
</script>

<style scoped lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.recordings-day {
  position: sticky;
  top: 0;
  background: transparentize($white, 0.15);
  padding: 0.5rem 0;
  font-size: 1em;
  font-weight: 600;
  border-bottom: 1px solid $gray-200;
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
    position: sticky;
    float: left;
    top: 40px;
    margin-left: -60px;
    margin-top: 15px;
  }
}

.recording-placeholder {
  height: 110px;
  margin-bottom: 15px;
}

.results.display-rows {
  overflow: auto;

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
</style>
