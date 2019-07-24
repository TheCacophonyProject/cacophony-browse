<template>
  <b-container fluid>
    <b-row>
      <div :class="['search-filter-wrapper', {'is-collapsed': searchPanelIsCollapsed}]">
        <QueryRecordings
          :disabled="queryPending"
          :query="query"
          :is-collapsed="searchPanelIsCollapsed"
          @submit="submitNewQuery"
          @toggled-search-panel="searchPanelIsCollapsed = !searchPanelIsCollapsed"
        />
      </div>
      <div class="search-content-wrapper">
        <div class="search-results">
          <div class="results-summary">
            <h1>Recordings</h1>
            <h2
              v-if="countMessage"
            >
              {{ countMessage }}
            </h2>
            <h5 v-else>
              Loading...
            </h5>
            <p
              class="search-description"
              v-html="searchDescription"
            />
            <div class="form-inline justify-content-end">
              <b-form-select
                id="recordsPerPage"
                v-model="perPage"
                :options="perPageOptions"
                class="form-control-sm"
                @input="pagination"
              />
            </div>

          </div>
          <div
            v-if="!queryPending"
            class="results"
          >
            <RecordingSummary
              v-for="(item, index) in tableItems"
              :item="item"
              :key="index"
            />
          </div>
          <div
            v-else
            class="results loading"
          >
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

        <div
          v-if="count > perPage"
          class="sticky-footer"
        >
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
    </b-row>
  </b-container>
</template>

<script>

import QueryRecordings from '../components/QueryRecordings/QueryRecordings.vue';
import TableRecordings from '../components/TableRecordings.vue';
import RecordingSummary from "../components/RecordingSummary.vue";
import api from '../api/index';

export default {
  name: 'RecordingsView',
  components: {RecordingSummary, QueryRecordings, TableRecordings},
  props: {},
  data() {
    return {
      query: this.resetQuery(),
      queryPending: false,
      searchPanelIsCollapsed: true,
      recordings: [],
      tableItems: [],
      count: null,
      countMessage: null,
      currentPage: null,
      perPage: 300,
      limitPaginationButtons: 5,
      perPageOptions: [
        {value: 10, text: "10 per page"},
        {value: 50, text: "50 per page"},
        {value: 100, text: "100 per page"},
        {value: 300, text: "300 per page"},
        {value: 500, text: "500 per page"},
        {value: 1000, text: "1000 per page"}
      ]
    };
  },
  computed: {
    searchDescription() {
      // Get the current search query, not the live updated one.
      const query = this.resetQuery();
      this.deserialiseRouteIntoQuery(this.$route.query, query);
      const numDevices = query.where.DeviceId.length;
      const multipleDeviceSuffix = numDevices > 1 ? 's' : '';
      const devices = numDevices !== 0 ? `${numDevices} device${multipleDeviceSuffix}` : 'All devices';
      query.where.type = query.where.type || 'both';
      const recordings = query.where.type === 'both' ? 'audio and video' : query.where.type;
      const numAnimals = query.tags.length;
      const multipleAnimalSuffix = numAnimals > 1 ? 's' : '';
      const tagsText = numAnimals === 0 ? 'all animals' : `${numAnimals} animal${multipleAnimalSuffix}`;
      let timespan = 'last 24 hours';
      const isCustom = query.where.dateRange.isCustom;
      const relativeDateRange = Number(query.where.dateRange.relativeDateRange);
      switch (relativeDateRange) {
      case -1:
        timespan = 'last 24 hours';
        break;
      case -3:
        timespan = 'last 3 days';
        break;
      case -7:
        timespan = 'last 7 days';
        break;
      }
      const formatDate = (str) => {
        str = str.replace(', ', '-');
        const date = new Date();
        let parts = str.split('-').map(str => str.trim());
        let time = [];
        const lastPart = parts.pop().split(' ').map(str => str.trim());
        parts.push(lastPart.shift());
        parts = parts.map(Number);
        date.setFullYear(parts[0]);
        date.setMonth(parts[1] - 1);
        date.setDate(parts[2]);
        if (lastPart.length) {
          time = lastPart[0].split(":").map(Number);
          date.setHours(time[0]);
          date.setMinutes(time[1]);
        }
        return date.toLocaleString();
      };
      console.log(
        query.where.recordingDateTime,
        'from ', formatDate(query.where.recordingDateTime['$gt']),
        'to', formatDate(query.where.recordingDateTime['$lt'])
      );
      timespan = !isCustom ?
        `in the <strong>${timespan}</strong>` :
        `between <strong>${formatDate(query.where.recordingDateTime['$gt'])}</strong> ` +
        `and <strong>${formatDate(query.where.recordingDateTime['$lt'])}</strong>`;
      return (
        `<strong>${devices}</strong>, <strong>${recordings} recordings</strong> and <strong>${tagsText}</strong> ` +
        `${timespan}`
      );
    }
  },
  watch: {
    '$route' () {
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
            "$gte": "0",
            "$lte": ""
          },
          recordingDateTime: {
            "$gt": "",
            "$lt": ""
          },
        },
        tagMode: 'any',
        tags: [],
        type: ''
      };
    },
    resetPagination() {
      this.currentPage = 1;
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
        this.currentPage = Math.ceil(this.$route.query.offset / this.perPage) + 1;
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
      this.$router.push({
        path: 'recordings',
        query: this.serialiseQuery(this.query),
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
          this.$set(target.where, 'recordingDateTime', {});
        }
        if (!target.where.dateRange) {
          this.$set(target.where, 'dateRange', {});
        } else {
          if (target.where.dateRange === 'customDateRange') {
            this.$set(target.where, 'dateRange', {isCustom: true});
          }
        }
        if (!target.where.hasOwnProperty('DeviceId')) {
          this.$set(target.where, 'DeviceId', []);
        }
        if (!target.where.duration) {
          this.$set(target.where, 'duration', {});
        }
        if (target.where.DeviceId && target.where.DeviceGroups) {
          target.where.DeviceId = [...target.where.DeviceId, ...target.where.DeviceGroups];
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
      if (query.where.hasOwnProperty('dateRange')) {
        // If it's a custom range, that can be inferred by the presence of recordingDateTime.
        // Otherwise, we'll synthesise recordingDateTime here from relative time.
        if (query.where.dateRange.hasOwnProperty('relativeDateRange')) {
          const padLeft = (str, char, len) => {
            while (str.length < len) {
              str = `${char}${str}`;
            }
            return str;
          };
          const formatDate = (date) => (
            `${date.getFullYear()}, ${padLeft(date.getMonth() + 1, '0', 2)}, ${padLeft(date.getDate(), '0', 2)} ${padLeft(date.getHours(), '0', 2)}:${padLeft(date.getMinutes(), '0', 2)}:${padLeft(date.getSeconds(), '0', 2)}`
          );
          const now = new Date();
          const oneDay = 1000 * 60 * 60 * 24;
          const relativeRangeDays = parseInt(query.where.dateRange.relativeDateRange);
          // Add time here, since relative date is negative
          const past = new Date(now.getTime() + (relativeRangeDays * oneDay));
          where.dateRange = {relativeDateRange: relativeRangeDays};
          where.recordingDateTime = {
            "$lt": formatDate(now),
            "$gt": formatDate(past),
          };
        } else if (query.where.hasOwnProperty('recordingDateTime')) {
          where.dateRange = 'customDateRange';
          // assume custom dateRange
          this.addIfSet(where, query.where.recordingDateTime["$gt"], "recordingDateTime", "$gt");
          this.addIfSet(where, query.where.recordingDateTime["$lt"], "recordingDateTime", "$lt");
        }
      }
      this.addIfSet(where, query.where.duration["$gte"], "duration", "$gte");
      this.addIfSet(where, query.where.duration["$lte"], "duration", "$lte");
      // add devices and devices from groups
      if (query.where.DeviceId.length !== 0) {
        const deviceIds = [];
        for (const device of query.where.DeviceId) {
          if (typeof device === 'object') {
            if (typeof device.id === 'number') {
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
          } else if (typeof device === 'number') {
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
        if (where.type === 'video') {
          where.type = 'thermalRaw';
        } else if (where.type === 'both') {
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
        tagMode: query.tagMode,
      };

      if (query.tags && query.tags.length > 0) {
        params.tags = query.tags;
      }

      for (const key in params) {
        const val = params[key];
        if (typeof val === 'object') {
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
      const {result, success} = await api.recording.query(this.serialiseQuery(this.query, true));
      this.queryPending = false;

      // Remove previous values *again* since it's possible for the query to have been called twice
      // since it's async, and then you'd append values twice.
      this.recordings = [];
      this.tableItems = [];

      if (!success) {
        result.messages && result.messages.forEach(message => {
          this.$store.dispatch('Messaging/WARN', message);
        });
      } else {
        this.recordings = result.rows;
        this.count = result.count;
        if (result.count > 0) {
          this.countMessage = `${result.count} matches found (total)`;
        } else if (result.count === 0) {
          this.countMessage = 'No matches';
        }
        this.tableItems = result.rows.map((row) => ({
          id: row.id,
          type: row.type,
          devicename: row.Device.devicename,
          groupname: row.Group.groupname,
          location: this.parseLocation(row.location),
          date: new Date(row.recordingDateTime).toLocaleDateString('en-NZ'),
          time: new Date(row.recordingDateTime).toLocaleTimeString(),
          duration: row.duration,
          tags: this.collateTags(row.Tags, row.Tracks),
          other: this.parseOther(row),
          processing_state: this.parseProcessingState(row.processingState)
        }));
      }
    },
    parseLocation(location) {
      if (location && typeof location === 'object') {
        const latitude = location.coordinates[0];
        const longitude = location.coordinates[1];
        return latitude + ', ' + longitude;
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
    collateTags: function (tags, tracks) {
      // Build a collection of tagItems - one per animal
      const tagItems = {};
      for (const tag of tags) {
        const tagName = tag.animal === null ? tag.event : tag.animal;
        this.addToListOfTags(tagItems, tagName, tag.automatic);
      }

      if (tracks) {
        for (const track of tracks) {
          for (const tag of track.TrackTags) {
            this.addToListOfTags(tagItems, tag.what, tag.automatic);
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
          animal = "F/P";
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
            class: 'text-success',
            order: subOrder
          });
        } else if (tagItem.human) {
          result.push({
            text: animal,
            class: '',
            order: 10 + subOrder
          });
        } else if (tagItem.automatic) {
          result.push({
            text: animal,
            class: 'text-danger',
            order: 20 + subOrder
          });
        }
      }
      // Sort the result array
      result.sort((a,b) => {
        return a.order - b.order;
      });
      return result;
    },
    addToListOfTags: function (allTags, tagName, isAutomatic) {
      var tag = allTags[tagName];
      if (!tag) {
        allTags[tagName] = tag = {};
      }

      if (isAutomatic) {
        allTags[tagName].automatic = true;
      } else {
        allTags[tagName].human = true;
      }
    },
  },
};
</script>

<style scoped lang="scss">
  @import "~bootstrap/scss/functions";
  @import "~bootstrap/scss/variables";
  @import "~bootstrap/scss/mixins";

  .search-filter-wrapper {
    background: $gray-100;
    position: relative;
    border-right: 1px solid $gray-200;
  }

  .search-content-wrapper {
    margin: 0 auto;
    flex-basis: 640px;
    h1 {
      margin: 2rem 0 1.2rem;
    }
    h2 {
      font-size: 1.2rem;
      margin-bottom: 0.8rem;
      color: $gray-700;
    }
    .search-results {
      max-width: 640px;
      margin: 0 auto;
      .results {
        padding: 1rem 0;
      }
    }
  }

  .recording-placeholder {
    height: 110px;
    margin-bottom: 15px;
  }

  .sticky-footer {
    background: $white;
    border-top: 1px solid $gray-200;
    padding: 7px;
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

  @include media-breakpoint-up(sm) {
    .search-content-wrapper {
      padding: 0 1.6rem;
    }
  }

  @include media-breakpoint-up(md) {
    .search-filter-wrapper {
      flex: 0 0 320px;
    }
    .search-content-wrapper {
      flex: 1 1 640px;
      position: relative;
      overflow: hidden;
      overflow-y: scroll;
      padding: 0;
      margin: 0;
      max-height: calc(100vh - var(--navbar-height));
    }
    .sticky-footer {
      position: sticky;
      bottom: 0;
    }
  }

</style>
