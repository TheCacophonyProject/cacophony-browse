<template>
  <div>
    <b-container>
      <QueryRecordings
        v-model="query"
        @searchButton="searchButton"/>

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
          <b-pagination
            v-if="count > perPage"
            :total-rows="count"
            v-model="currentPage"
            :per-page="perPage"
            :limit="limitPaginationButtons"
            class="pagination-buttons"
            align="center"
            @input="pagination"/>
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
      query: {},
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
  methods: {
    searchButton() {
      // Loading wheel here
      this.countMessage = "";
      this.currentPage = 1;
      this.getRecordings();
    },
    pagination() {
      // Only get recordings if there is a where query ie will only run after
      // "Search" has been pushed at least once
      if (this.query.where) {
        this.getRecordings();
      }
    },
    async getRecordings() {
      // Remove previous values
      this.recordings = [];
      this.tableItems = [];
      // Create query params object
      const params = {
        where: JSON.stringify(this.query.where),
        limit: this.perPage,
        offset: (this.currentPage - 1) * this.perPage
      };

      if (this.query.tagMode) {
        params.tagMode = this.query.tagMode;
      }
      if (this.query.tags) {
        params.tags = JSON.stringify(this.query.tags);
      }

      // Call API and process results
      const response = await api.recording.query(params);

      if (!response.success) {
        response.messages && response.messages.forEach(message => {
          this.$store.dispatch('Messaging/WARN', message);
        });
      } else {
        this.recordings = response.rows;
        this.count = response.count;
        if (response.count > 0) {
          this.countMessage = `${response.count} matches found (total)`;
        } else if (response.count === 0) {
          this.countMessage = 'No matches';
        }
        response.rows.map((row) => {
          this.tableItems.push({
            id: row.id,
            type: row.type,
            devicename: row.Device.devicename,
            groupname: row.Group.groupname,
            location: this.parseLocation(row.location),
            date: new Date(row.recordingDateTime).toLocaleDateString('en-NZ'),
            time: new Date(row.recordingDateTime).toLocaleTimeString(),
            duration: row.duration,
            tags: this.collateTags(row.Tags),
            other: this.parseOther(row),
            processing_state: this.parseProcessingState(row.processingState)
          });
        });
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
    collateTags: function (tags) {
      // Build a collection of tagItems - one per animal
      const tagItems = {};
      for (const tag of tags) {
        const animal = tag.animal === null ? tag.event : tag.animal;
        if (!tagItems[animal]) {
          // Animal has not been seen yet
          tagItems[animal] = {};
        }
        if (tag.automatic) {
          tagItems[animal].automatic = true;
        } else {
          tagItems[animal].human = true;
        }
      }
      // Use automatic and human status to create an ordered array of objects
      // suitable for parsing into coloured spans
      const result = [];
      for (let animal of Object.keys(tagItems).sort()) {
        const tagItem = tagItems[animal];
        let subOrder = 0;
        if (animal == "z_false positive") {
          animal = "F/P";
          subOrder = 3;
        } else if (animal == "z_multiple animals") {
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
    }
  }
};
</script>

<style scoped>
  .information-line {
    padding-top: 5px;
    padding-bottom: 5px;
  }
</style>
