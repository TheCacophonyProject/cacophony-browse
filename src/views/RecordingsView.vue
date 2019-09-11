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
          :disabled="queryPending"
          :query="query"
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
            <p 
              class="search-description" 
              v-html="searchDescription" />
          </div>
          <div 
            v-if="!queryPending" 
            class="results">
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
              v-else 
              class="all-rows">
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
          <div 
            v-else 
            class="results loading">
            <div
              v-for="i in 10"
              :style="{
                background: `rgba(240, 240, 240, ${1 / i}`
              }"
              :key="i"
              class="recording-placeholder"
            />
          </div>
          <div 
            v-if="countMessage === 'No matches'" 
            class="no-results">
            <h6 class="text-muted">No recordings found</h6>
            <p class="small text-muted">Try modifying your search criteria.</p>
          </div>
        </div>

        <div 
          v-if="count > perPage" 
          class="sticky-footer">
          <div class="pagination-per-page">
            <b-form-select
              id="recordsPerPage"
              v-model="perPage"
              :options="perPageOptions"
              class="results-per-page"
              @input="pagination"
            />
            <b-pagination
              :total-rows="count"
              v-model="currentPage"
              :per-page="perPage"
              :limit="limitPaginationButtons"
              class="pagination-buttons"
              @input="pagination"
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
      query: this.resetQuery(),
      queryPending: false,
      lastQuery: null,
      searchPanelIsCollapsed: true,
      recordings: [],
      tableItems: [],
      count: null,
      countMessage: null,
      currentPage: null,
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
    },
    searchDescription() {
      // Get the current search query, not the live updated one.
      if (this.lastQuery !== null) {
        const query = this.lastQuery;
        const numDevices = query.where.DeviceId.length;
        const multipleDeviceSuffix = numDevices > 1 ? "s" : "";
        const devices =
          numDevices !== 0
            ? `${numDevices} device${multipleDeviceSuffix}`
            : "All devices";

        query.where.type =
          query.where.type || this.$store.state.User.recordingTypePref;
        const recordings =
          query.where.type === "both" ? "audio and video" : query.where.type;
        const numAnimals = query.tags.length;
        const multipleAnimalSuffix = numAnimals > 1 ? "s" : "";
        const tagsText =
          numAnimals === 0
            ? "all animals"
            : `${numAnimals} animal${multipleAnimalSuffix}`;
        const isCustom =
          query.where.dateRange && query.where.dateRange.isCustom;
        const isAll = query.where.dateRange && query.where.dateRange.all;
        const relativeDateRange = Math.abs(
          Number(query.where.dateRange.relativeDateRange)
        );
        let timespan;
        if (relativeDateRange === 1) {
          timespan = "last 24 hours";
        } else if (isAll || isNaN(relativeDateRange)) {
          timespan = "";
        } else {
          timespan = `last ${relativeDateRange} days`;
        }

        const duration = query.where.duration;
        const durationFrom =
          duration.hasOwnProperty("$gte") && Number(duration["$gte"]);
        const durationTo =
          duration.hasOwnProperty("$lte") && Number(duration["$lte"]);
        let durationStr = "";
        if (
          durationFrom !== false &&
          durationTo !== false &&
          durationTo !== 0
        ) {
          durationStr = ` with durations <strong>${durationFrom}</strong>&nbsp;&ndash;&nbsp;<strong>${durationTo}s</strong>`;
        } else if (durationFrom !== false && durationFrom !== 0) {
          durationStr = ` with durations <strong>> ${durationFrom}s</strong>`;
        }

        const formatDate = (str, addDays) => {
          const date = new Date();
          let parts = str.split("-").map(str => str.trim());
          let time = [];
          const lastPart = parts
            .pop()
            .split(" ")
            .map(str => str.trim());
          parts.push(lastPart.shift());
          parts = parts.map(Number);
          date.setFullYear(parts[0]);
          date.setMonth(parts[1] - 1);
          date.setDate(parts[2] + addDays);
          if (lastPart.length) {
            time = lastPart[0].split(":").map(Number);
            date.setHours(time[0]);
            date.setMinutes(time[1]);
            date.setSeconds(time[2]);
          }
          return date.toLocaleDateString("en-NZ").split(",")[0];
        };
        if (!isAll) {
          timespan = !isCustom
            ? `in the <strong>${timespan}</strong>`
            : `between <strong>${formatDate(
              query.where.recordingDateTime["$gt"],
              0
            )}</strong>&nbsp;
              and&nbsp;<strong>${formatDate(
    query.where.recordingDateTime["$lt"],
    1
  )}</strong>${durationStr}`;
        }
        return (
          `<strong>${devices}</strong>, <strong>${recordings} recordings</strong> and <strong>${tagsText}</strong> ` +
          `${timespan}${durationStr}`
        );
      } else {
        return "";
      }
    },
    serialisedQuery() {
      const query = this.lastQuery || this.query;
      return this.serialiseQuery(query, true);
    }
  },
  watch: {
    $route() {
      // Create/update the query object from the route string
      this.parseCurrentRoute();
    }
  },
  mounted() {
    this.parseCurrentRoute();
    this.updateRouteQuery();
  },
  methods: {
    resetQuery() {
      return {
        where: {
          DeviceId: [],
          duration: {
            $gte: "0",
            $lte: ""
          },
          recordingDateTime: {
            $gt: "",
            $lt: ""
          },
          dateRange: {
            relativeDateRange: -30
          }
        },
        tagMode: "any",
        tags: [],
        type: ""
      };
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
    resetPagination() {
      this.currentPage = 1;
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
    parseCurrentRoute() {
      if (Object.keys(this.$route.query).length === 0) {
        // Populate the url params if we got here without them, ie. /recordings
        this.resetPagination();
        this.query = this.resetQuery();
        this.updateRouteQuery();
      }
      this.deserialiseRouteIntoQuery(this.$route.query);
      if (this.$route.query.offset) {
        this.currentPage =
          Math.ceil(this.$route.query.offset / this.perPage) + 1;
      }
      this.getRecordings();
    },
    pagination() {
      this.updateRouteQuery();
    },
    submitNewQuery() {
      // New query, so reset pagination.
      this.resetPagination();
      this.updateRouteQuery();
    },
    updateRouteQuery() {
      // Update the url query params string so that this search can be easily shared.
      this.lastQuery = JSON.parse(JSON.stringify(this.query));
      this.$router.push({
        path: "recordings",
        query: this.serialiseQuery(this.query)
      });
    },
    deserialiseRouteIntoQuery(routeQuery, target) {
      target = target || this.query;
      for (const key in routeQuery) {
        if (routeQuery.hasOwnProperty(key)) {
          target[key] = routeQuery[key];
        }
      }
      if (routeQuery.where) {
        target.where = JSON.parse(routeQuery.where);
        if (!target.where.recordingDateTime) {
          this.$set(target.where, "recordingDateTime", {});
        }
        if (!target.where.dateRange) {
          this.$set(target.where, "dateRange", {});
        } else {
          if (target.where.dateRange === "customDateRange") {
            this.$set(target.where, "dateRange", { isCustom: true });
          } else if (target.where.dateRange === "all") {
            this.$set(target.where, "dateRange", { all: true });
          }
        }
        if (!target.where.hasOwnProperty("DeviceId")) {
          this.$set(target.where, "DeviceId", []);
        }
        if (!target.where.duration) {
          this.$set(target.where, "duration", {});
        }
        if (target.where.DeviceId && target.where.DeviceGroups) {
          target.where.DeviceId = [
            ...target.where.DeviceId,
            ...target.where.DeviceGroups
          ];
        } else if (target.where.DeviceGroups) {
          target.where.DeviceId = [...target.where.DeviceGroups];
        }
      }
      if (routeQuery.tags) {
        target.tags = JSON.parse(routeQuery.tags);
      }
    },
    addIfSet(map, value, submap, key) {
      if (value && value.trim() !== "") {
        map[submap] = map[submap] || {};
        map[submap][key] = value;
      }
    },
    serialiseQuery(query, useForApiCall = false) {
      const where = {};
      where.type = query.where.type;
      if (query.where.hasOwnProperty("dateRange")) {
        // If it's a custom range, that can be inferred by the presence of recordingDateTime.
        // Otherwise, we'll synthesise recordingDateTime here from relative time.
        if (query.where.dateRange.hasOwnProperty("all")) {
          where.dateRange = "all";
        } else if (query.where.dateRange.hasOwnProperty("relativeDateRange")) {
          const padLeft = (str, char, len) => {
            while (str.toString().length < len) {
              str = `${char}${str}`;
            }
            return str;
          };
          const formatQueryDate = date =>
            `${date.getFullYear()}-${padLeft(
              date.getMonth() + 1,
              "0",
              2
            )}-${padLeft(date.getDate(), "0", 2)} ${padLeft(
              date.getHours(),
              "0",
              2
            )}:${padLeft(date.getMinutes(), "0", 2)}:${padLeft(
              date.getSeconds(),
              "0",
              2
            )}`;
          const now = new Date();
          const oneDay = 1000 * 60 * 60 * 24;
          const relativeRangeDays = parseInt(
            query.where.dateRange.relativeDateRange
          );
          // Add time here, since relative date is negative
          const past = new Date(now.getTime() + relativeRangeDays * oneDay);
          where.dateRange = {
            relativeDateRange: relativeRangeDays
          };
          where.recordingDateTime = {
            $lt: formatQueryDate(now),
            $gt: formatQueryDate(past)
          };
        } else if (query.where.hasOwnProperty("recordingDateTime")) {
          if (
            query.where.recordingDateTime.hasOwnProperty("$gt") &&
            query.where.recordingDateTime.hasOwnProperty("$lt")
          ) {
            where.dateRange = "customDateRange";
            // assume custom dateRange
            this.addIfSet(
              where,
              query.where.recordingDateTime["$gt"],
              "recordingDateTime",
              "$gt"
            );
            this.addIfSet(
              where,
              query.where.recordingDateTime["$lt"],
              "recordingDateTime",
              "$lt"
            );
          }
        }
      }
      this.addIfSet(where, query.where.duration["$gte"], "duration", "$gte");
      this.addIfSet(where, query.where.duration["$lte"], "duration", "$lte");
      // add devices and devices from groups
      if (query.where.DeviceId.length !== 0) {
        const deviceIds = [];
        for (const device of query.where.DeviceId) {
          if (typeof device === "object") {
            if (typeof device.id === "number") {
              // Add single devices
              deviceIds.push(device.id);
            } else {
              // NOTE: if the device is a group, the id is a string.
              // Add groups of devices
              where.DeviceGroups = where.DeviceGroups || [];
              where.DeviceGroups.push(device.id);
              if (device.devices) {
                for (const item of device.devices) {
                  deviceIds.push(item.id);
                }
              }
            }
          } else if (typeof device === "number") {
            // We're reconstituting this from the query params, so we only have
            // device ids at this stage, we don't have the labels.
            deviceIds.push(device);
          }
        }
        // Dedupe ids.
        where.DeviceId = deviceIds.reduce((acc, id) => {
          !acc.includes(id) && acc.push(id);
          return acc;
        }, []);
        if (where.DeviceGroups && where.DeviceGroups.length !== 0) {
          // Dedupe ids.
          where.DeviceGroups = where.DeviceGroups.reduce((acc, id) => {
            !acc.includes(id) && acc.push(id);
            return acc;
          }, []);
        }
      }

      if (useForApiCall) {
        // Map between the mismatch in video type types between frontend and backend
        if (where.type === "video") {
          where.type = "thermalRaw";
        } else if (where.type === "both") {
          delete where.type;
        }
        // Remove the group param, since the API doesn't handle that, we're just using
        // it to accurately share search parameters via urls.
        delete where.DeviceGroups;
        delete where.dateRange;
      }
      // Work out current pagination offset.
      const newOffset = Math.max(0, (this.currentPage - 1) * this.perPage);

      const params = {
        where: where,
        limit: this.perPage,
        offset: newOffset,
        tagMode: query.tagMode
      };

      if (query.tags && query.tags.length > 0) {
        params.tags = query.tags;
      }

      for (const key in params) {
        const val = params[key];
        if (typeof val === "object") {
          params[key] = JSON.stringify(val);
        }
      }

      return params;
    },
    async getRecordings() {
      // Remove previous values
      this.countMessage = "";
      this.recordings = [];
      this.tableItems = [];
      // Call API and process results
      this.queryPending = true;
      const { result, success } = await api.recording.query(
        this.serialiseQuery(this.query, true)
      );
      this.queryPending = false;

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
            if (
              prevDate === null ||
              roundDate(thisDate).getTime() !== roundDate(prevDate).getTime()
            ) {
              item.date = thisDate;
            }
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

.search-filter-wrapper {
  background: $gray-100;
  position: relative;
  border-right: 1px solid $gray-200;
}

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

@include media-breakpoint-down(md) {
  .search-filter-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    transform: translate(0);
    max-width: var(--search-panel-width);
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
