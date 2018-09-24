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
      this.getRecordings();
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
            tags: this.parseTags(row.Tags),
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
    parseTags(tags) {
      if (tags.length > 0) {
        const animal = (tag) => {
          if (!tag.animal) {
            return "F/P";
          } else {
            return tag.animal;
          }
        };
        let tagString = animal(tags[0]);
        for (let i = 1; i < tags.length; i++) {
          const animalName = animal(tags[i]);
          tagString = tagString + ', ' + animalName;
        }
        return tagString;
      } else {
        return 'untagged';
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
