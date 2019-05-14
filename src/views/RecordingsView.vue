<template>
  <div>
    <b-container>
      <QueryRecordings
        :disabled="queryPending"
        :query="query"
        @submit="submitNewQuery"
      />
      <b-form-row class="information-line">
        <b-col lg="4">
          <b-form-text>
            <h5
              v-if="countMessage"
              style="text-align: center;">
              {{ countMessage }}
            </h5>
          </b-form-text>
        </b-col>

        <b-col
          md="6"
          lg="4">
          <!-- Pagination used to go here, now just an empty space to keep things
              aligned until the rest of the UI gets its redesign -->
        </b-col>

        <b-col
          md="6"
          lg="4">
          <b-form-group>
            <b-form-select
              v-model="perPage"
              :options="perPageOptions"
              style="text-align: center;"
              @input="pagination"
            />
          </b-form-group>
        </b-col>
      </b-form-row>

    </b-container>
    <TableRecordings :items="tableItems"/>
    <div class="sticky-footer">
      <b-pagination
        v-if="count > perPage"
        :total-rows="count"
        v-model="currentPage"
        :per-page="perPage"
        :limit="limitPaginationButtons"
        class="pagination-buttons"
        align="center"
        @input="pagination"/>
    </div>
  </div>
</template>

<script>

import QueryRecordings from '../components/QueryRecordings/QueryRecordings.vue';
import TableRecordings from '../components/TableRecordings.vue';
import api from '../api/index';

export default {
  name: 'RecordingsView',
  components: {QueryRecordings, TableRecordings},
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
    deserialiseRouteIntoQuery(routeQuery) {
      for (const key in routeQuery) {
        this.query[key] = routeQuery[key];
      }
      if (routeQuery.where) {
        this.query.where = JSON.parse(routeQuery.where);
        if (!this.query.where.recordingDateTime) {
          this.$set(this.query.where, 'recordingDateTime', {});
        }
        if (!this.query.where.hasOwnProperty('DeviceId')) {
          this.$set(this.query.where, 'DeviceId', []);
        }
        if (!this.query.where.duration) {
          this.$set(this.query.where, 'duration', {});
        }
        if (this.query.where.DeviceId && this.query.where.DeviceGroups) {
          this.query.where.DeviceId = [...this.query.where.DeviceId, ...this.query.where.DeviceGroups];
        } else if (this.query.where.DeviceGroups) {
          this.query.where.DeviceId = [...this.query.where.DeviceGroups];
        }
      }
      if (routeQuery.tags) {
        this.query.tags = JSON.parse(routeQuery.tags);
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
        } else if (where.type !== 'both') {
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
        tags: query.tags
      };

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
  .information-line {
    padding-top: 5px;
    padding-bottom: 5px;
  }

  .sticky-footer {
    position: fixed;
    width: 100%;
    bottom: 0;
    left: auto;
    padding-top: 10px;
    padding-bottom: 10px;
    background-color: white;
    border-top: solid rgb(222, 226, 230) 1px;
  }

  .pagination-buttons {
    margin-bottom: 0px;
  }
</style>
