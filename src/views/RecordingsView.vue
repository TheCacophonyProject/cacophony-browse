<template>
  <div>
    <b-container fluid>
      <b-row>
        <b-col
          class="search-col"
          md="2"
        >
          <QueryRecordings
            :disabled="queryPending"
            :query="query"
            @submit="submitNewQuery"
          />
        </b-col>
        <b-col class="content">
          <b-row class="information-line">
            <b-row class="results-summary">
              <b-col>
                <b-row>
                  <h1>Recordings</h1>
                </b-row>
                <b-row>
                  <b-form-text>
                    <h5
                      v-if="countMessage"
                    >
                      {{ countMessage }}
                    </h5>
                    <h5 v-else>
                      Loading...
                    </h5>
                    <p
                      class="search-description"
                      v-html="searchDescription"
                    />
                  </b-form-text>
                </b-row>
                <b-row>
                  <b-form-group>
                    <b-form-select
                      v-model="perPage"
                      :options="perPageOptions"
                      style="text-align: center;"
                      @input="pagination"
                    />
                  </b-form-group>
                </b-row>
              </b-col>
            </b-row>
          </b-row>
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
            <b-row
              v-for="i in 10"
              :style="{ background: `rgba(240, 240, 240, ${1 / i}` }"
              :key="i"
              class="recording-placeholder"
            />
          </div>
          <b-row
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
          </b-row>
        </b-col>
      </b-row>
    </b-container>
  </div>
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
      const timespan = 'last 24 hours';
      return (
        `<strong>${devices}</strong>, <strong>${recordings} recordings</strong> and <strong>${tagsText}</strong> in ` +
        `the <strong>${timespan}</strong>`
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
      this.addIfSet(where, query.where.recordingDateTime["$gt"], "recordingDateTime", "$gt");
      this.addIfSet(where, query.where.recordingDateTime["$lt"], "recordingDateTime", "$lt");
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

<style scoped>
  .search-col {
    background-color: #f0f2ef;
  }
  .information-line h5 {
    font-size: 16px;
  }
  .results {
    width: 100%;
    display: block;
    overflow-y: auto;
  }
  .recording-placeholder {
    min-height: 109px;
  }
  .results > .row, .information-line > .row {
    max-width: 635px;
    min-width: 635px;
    margin: 15px auto;
  }
  .content {
    position: relative;
    overflow: hidden;
    overflow-y: scroll;
    padding: 0;
    margin: 0;
    max-height: calc(100vh - var(--navbar-height));
    min-height: calc(100vh - var(--navbar-height));
  }

  .search-description {
    color: #111;
    font-size: 14px;
    line-height: 22px;
  }

  .sticky-footer {
    width: 100%;
    padding-top: 10px;
    padding-bottom: 10px;
    border-top: solid rgb(222, 226, 230) 1px;
    display: flex;
    justify-content: center;
    min-width: 100%;
    max-width: 100%;
    background: white;
    position: sticky;
    bottom: 0;
    margin: 0;
  }
  .pagination-buttons {
    margin-bottom: 0;
  }
</style>
