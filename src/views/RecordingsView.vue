<template>
  <b-container fluid>
    <b-row>
      <div
        :class="[
          'search-filter-wrapper',
          { 'is-collapsed': searchPanelIsCollapsed }
        ]"
      >
        <QueryRecordings
          ref="queryRec"
          :disabled="queryPending"
          :currentPage="currentPage"
          :perPage="perPage"
          :path="'recordings'"
          :is-collapsed="searchPanelIsCollapsed"
          @submit="submitNewQuery"
          @toggled-search-panel="
            searchPanelIsCollapsed = !searchPanelIsCollapsed
          "
        />
      </div>
      <div :class="['search-content-wrapper', { 'display-rows': !showCards }]">
        <div class="search-results">
          <div class="results-summary">
            <div class="float-right">
              <b-button
                variant="light"
                class="display-toggle btn-sm"
                @click="toggleResultsDisplayStyle"
              >
                Display as {{ showCards ? "rows" : "cards" }}
              </b-button>
              <CsvDownload :params="serialisedQuery" />
            </div>

            <h1>Recordings</h1>
            <h2 v-if="countMessage">
              {{ countMessage }}
            </h2>
            <h5 v-else>
              Loading...
            </h5>
            <p class="search-description" v-html="searchDescription" />
          </div>
          <div v-if="!queryPending" class="results">
            <div v-if="showCards">
              <div
                v-for="(itemsByDay, index_a) in tableItemsChunkedByDayAndHour"
                :key="index_a"
              >
                <h4 class="recordings-day">{{ relativeDay(itemsByDay) }}</h4>
                <div
                  v-for="(itemsByHour, index_b) in itemsByDay"
                  :key="index_b"
                >
                  <h5 class="recordings-hour">{{ hour(itemsByHour) }}</h5>
                  <RecordingSummary
                    v-for="(item, index) in itemsByHour"
                    :item="item"
                    :key="`${index}_${getResultsDisplayStyle}`"
                    :display-style="getResultsDisplayStyle"
                  />
                </div>
              </div>
            </div>
            <div
              v-else-if="tableItems && tableItems.length !== 0"
              class="all-rows"
            >
              <div class="results-header">
                <div>
                  <span>ID</span>
                  <span>Type</span>
                  <span>Device</span>
                  <span>Group</span>
                  <span>Location</span>
                  <span>Date</span>
                  <span>Time</span>
                  <span>Duration</span>
                  <span>Tags</span>
                  <span>Battery</span>
                </div>
              </div>
              <div class="results-rows">
                <RecordingSummary
                  v-for="(item, index) in tableItems"
                  :item="item"
                  :is-even-row="index % 2 === 1"
                  :key="`${index}_${getResultsDisplayStyle}`"
                  :display-style="getResultsDisplayStyle"
                />
              </div>
            </div>
          </div>
          <div v-else class="results loading">
            <div
              v-for="i in 10"
              :style="{
                background: `rgba(240, 240, 240, ${1 / i}`
              }"
              :key="i"
              class="recording-placeholder"
            />
          </div>
          <div v-if="countMessage === 'No matches'" class="no-results">
            <h6 class="text-muted">No recordings found</h6>
            <p class="small text-muted">Try modifying your search criteria.</p>
          </div>
        </div>

        <div class="sticky-footer">
          <div class="pagination-per-page">
            <b-form-select
              id="recordsPerPage"
              v-model="perPage"
              :options="perPageOptions"
              class="results-per-page"
              @change="perPageChanged"
            />
            <b-pagination
              :total-rows="count"
              v-model="currentPage"
              :per-page="perPage"
              :limit="limitPaginationButtons"
              class="pagination-buttons"
              @change="pagination"
              v-if="count > perPage"
            />
          </div>
        </div>
      </div>
    </b-row>
  </b-container>
</template>
<script>
import QueryRecordings from "../components/QueryRecordings/QueryRecordings.vue";
import CsvDownload from "../components/QueryRecordings/CsvDownload.vue";
import RecordingSummary from "../components/RecordingSummary.vue";
import api from "../api/index";

const roundDate = (date, toHour = false) => {
  const d = new Date(date.getTime());
  d.setSeconds(0);
  d.setMinutes(0);
  d.setMilliseconds(0);
  if (!toHour) {
    d.setHours(0);
  }
  return d;
};

export default {
  name: "RecordingsView",
  components: { RecordingSummary, QueryRecordings, CsvDownload },
  props: {},
  data() {
    return {
      searchDescription: null,
      serialisedQuery: {},
      queryPending: false,
      searchPanelIsCollapsed: true,
      recordings: [],
      tableItems: [],
      count: null,
      countMessage: null,
      currentPage: 1,
      perPage: 100,
      showCards: this.getPreferredResultsDisplayStyle(),
      limitPaginationButtons: 5,
      perPageOptions: [
        { value: 10, text: "10 per page" },
        { value: 50, text: "50 per page" },
        { value: 100, text: "100 per page" },
        { value: 300, text: "300 per page" },
        { value: 500, text: "500 per page" },
        { value: 1000, text: "1000 per page" }
      ]
    };
  },
  watch: {
    $route() {
      if (this.$route.query.limit) {
        this.perPage = Number(this.$route.query.limit);
      } else {
        this.perPage = 100;
      }
      if (this.$route.query.offset) {
        this.currentPage =
          Math.ceil(this.$route.query.offset / this.perPage) + 1;
      } else {
        this.currentPage = 1;
      }
    }
  },
  mounted() {
    if (this.$route.query.limit) {
      this.perPage = Number(this.$route.query.limit);
    }
    if (this.$route.query.offset) {
      this.currentPage = Math.ceil(this.$route.query.offset / this.perPage) + 1;
    }
  },
  computed: {
    tableItemsChunkedByDayAndHour() {
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
    getResultsDisplayStyle() {
      return this.showCards ? "card" : "row";
    }
  },
  methods: {
    pagination(page) {
      this.$refs.queryRec.updatePagination(this.perPage, page);
    },
    perPageChanged(perPage) {
      this.$refs.queryRec.updatePagination(perPage, this.currentPage);
    },
    relativeDay(itemDate) {
      itemDate = itemDate[0][0].dateObj;
      const todayDate = new Date();
      const today = roundDate(todayDate);
      const date = roundDate(itemDate).getTime();
      todayDate.setDate(todayDate.getDate() - 1);
      const yesterday = roundDate(todayDate);
      if (date === today.getTime()) {
        return "Today";
      } else if (date === yesterday.getTime()) {
        return "Yesterday";
      } else {
        return `${itemDate.toDateString()}`;
      }
    },
    hour(itemDate) {
      itemDate = itemDate[0].dateObj;
      const dateWithHours = roundDate(itemDate, true);
      const hours = dateWithHours.getHours();
      if (hours === 0) {
        return "12am";
      }
      return `${hours <= 12 ? hours : hours - 12}${hours < 12 ? "am" : "pm"}`;
    },
    getPreferredResultsDisplayStyle() {
      return localStorage.getItem("results-display-style") !== "row";
    },
    toggleResultsDisplayStyle() {
      this.showCards = !this.showCards;
      localStorage.setItem(
        "results-display-style",
        this.showCards ? "card" : "row"
      );
    },
    submitNewQuery(whereQuery) {
      this.serialisedQuery = whereQuery;
      this.getRecording(whereQuery);
    },
    async getRecording(whereQuery) {
      // Remove previous values
      this.countMessage = "";
      this.recordings = [];
      this.tableItems = [];
      // Call API and process results
      this.queryPending = true;
      const { result, success } = await api.recording.query(whereQuery);
      this.queryPending = false;
      this.searchDescription = this.$refs.queryRec.searchDescription();

      // Remove previous values *again* since it's possible for the query to have been called twice
      // since it's async, and then you'd append values twice.
      this.recordings = [];
      this.tableItems = [];

      if (!success) {
        result.messages &&
          result.messages.forEach(message => {
            this.$store.dispatch("Messaging/WARN", message);
          });
      } else {
        this.recordings = result.rows;
        this.count = result.count;
        if (result.count > 0) {
          this.countMessage = `${result.count} matches found (total)`;
        } else if (result.count === 0) {
          this.countMessage = "No matches";
        }
        // New day, new hour.
        let prevDate = null;
        for (const row of result.rows) {
          const thisDate = new Date(row.recordingDateTime);
          if (
            prevDate === null ||
            roundDate(thisDate, true).getTime() !==
              roundDate(prevDate, true).getTime()
          ) {
            const item = {
              kind: "dataSeparator",
              hour: thisDate
            };
            item.date = thisDate;
            this.tableItems.push(item);
            prevDate = thisDate;
          }
          this.tableItems.push({
            kind: "dataRow",
            id: row.id,
            type: row.type,
            devicename: row.Device.devicename,
            groupname: row.Group.groupname,
            location: this.parseLocation(row.location),
            dateObj: thisDate,
            date: thisDate.toLocaleDateString("en-NZ"),
            time: thisDate.toLocaleTimeString(),
            duration: row.duration,
            tags: this.collateTags(row.Tags, row.Tracks),
            other: this.parseOther(row),
            processing_state: this.parseProcessingState(row.processingState)
          });
        }
      }
    },
    parseLocation(location) {
      if (location && typeof location === "object") {
        const latitude = location.coordinates[0];
        const longitude = location.coordinates[1];
        return latitude + ", " + longitude;
      } else {
        return "(unknown)";
      }
    },
    parseOther(row) {
      const out = {};
      if (row.batteryLevel !== null) {
        out.batteryLevel = row.batteryLevel;
      }
      return out;
    },
    parseProcessingState(result) {
      const string = result.toLowerCase();
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    collateTags: function(tags, tracks) {
      // Build a collection of tagItems - one per animal
      const tagItems = {};
      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        const tagName = tag.animal === null ? tag.event : tag.animal;
        const taggerId = taggerId;

        this.addToListOfTags(tagItems, tagName, tag.automatic, taggerId);
      }

      if (tracks) {
        for (let j = 0; j < tracks.length; j++) {
          const track = tracks[j];
          for (let i = 0; i < track.TrackTags.length; i++) {
            const tag = track.TrackTags[i];
            const taggerId = tag.UserId || tag.taggerId;
            this.addToListOfTags(tagItems, tag.what, tag.automatic, taggerId);
          }
        }
      }

      // Use automatic and human status to create an ordered array of objects
      // suitable for parsing into coloured spans
      const result = [];
      for (let animal of Object.keys(tagItems).sort()) {
        const tagItem = tagItems[animal];
        let subOrder = 0;
        if (animal == "false positive") {
          animal = "false positive";
          subOrder = 3;
        } else if (animal == "multiple animals") {
          animal = "multiple";
          subOrder = 2;
        } else if (animal == "unidentified") {
          animal = "?";
          subOrder = 1;
        }

        if (tagItem.automatic && tagItem.human) {
          result.push({
            text: animal,
            class: "automatic human",
            taggerIds: tagItem.taggerIds,
            order: subOrder
          });
        } else if (tagItem.human) {
          result.push({
            text: animal,
            class: "human",
            taggerIds: tagItem.taggerIds,
            order: 10 + subOrder
          });
        } else if (tagItem.automatic) {
          result.push({
            text: animal,
            class: "automatic",
            order: 20 + subOrder
          });
        }
      }
      // Sort the result array
      result.sort((a, b) => {
        return a.order - b.order;
      });
      return result;
    },
    addToListOfTags: function(allTags, tagName, isAutomatic, taggerId) {
      const tag = allTags[tagName] || {};
      tag.taggerIds = tag.taggerIds || [];
      if (taggerId && tag.taggerIds.indexOf(taggerId) === -1) {
        tag.taggerIds.push(taggerId);
      }
      if (isAutomatic) {
        tag.automatic = true;
      } else {
        tag.human = true;
      }
      allTags[tagName] = tag;
    }
  }
};
</script>

<style scoped lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

$main-content-width: 640px;

.search-content-wrapper {
  margin: 0 auto;
  flex-basis: $main-content-width;
  padding: 0 1em;
  h1 {
    margin: 2rem 0 1.2rem;
  }
  h2 {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
    color: $gray-700;
  }

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
      margin-top: -2.8rem;
      padding: 0.7rem 0;
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

  .search-results {
    max-width: $main-content-width;
    margin: 0 auto;
  }

  &.display-rows {
    .search-results {
      margin: 0;
      width: 100%;
      max-width: calc(100vw - 2em);
    }

    .results {
      overflow: auto;
    }

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
}

.recording-placeholder {
  height: 110px;
  margin-bottom: 15px;
}

.no-results {
  display: flex;
  flex-flow: column nowrap;
  margin-top: 20vh;
  text-align: center;
}

.sticky-footer {
  background: $white;
  border-top: 1px solid $gray-200;
  padding: 7px;
  .pagination-per-page {
    max-width: $main-content-width;
    margin: 0 auto;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    .results-per-page {
      width: auto;
      float: right;
    }
  }
  .pagination {
    margin-bottom: 0;
    justify-content: center;
  }
}

.search-filter-wrapper {
  background: $gray-100;
  position: relative;
  border-right: 1px solid $gray-200;
}

@include media-breakpoint-down(md) {
  .search-filter-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    transform: translate(0);
    width: var(--search-panel-width);
    z-index: 2;
    transition: transform 0.2s;
    &.is-collapsed {
      transform: translate(var(--search-panel-offset));
    }
  }
}

@include media-breakpoint-up(md) {
  .search-filter-wrapper {
    flex: 0 0 320px;
  }
  .search-content-wrapper {
    flex: 1 1 $main-content-width;
    position: relative;
    overflow: hidden;
    overflow-y: scroll;
    margin: 0;
    max-height: calc(100vh - var(--navbar-height));
  }
  .sticky-footer {
    position: sticky;
    bottom: 0;
  }
}
.display-toggle {
  margin-right: 5px;
}
</style>
