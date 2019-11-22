<template>
  <b-container fluid>
    <b-row>
      <QueryRecordings
        ref="queryRec"
        :disabled="queryPending"
        :path="'visits'"
        :is-collapsed="searchPanelIsCollapsed"
        @submit="submitNewQuery"
        @toggled-search-panel="searchPanelIsCollapsed = !searchPanelIsCollapsed"
      />
      <div :class="['search-content-wrapper']">
        <div class="search-results">
          <div class="results-summary">
            <h1>Visits</h1>
            <h2 v-if="countMessage">
              {{ countMessage }}
            </h2>
            <h5 v-else>
              Loading...
            </h5>
            <p class="search-description" v-html="searchDescription"></p>
            <div v-if="!queryPending" class="results">
              <div v-if="visits.length > 0">
                <b-table
                  ref="visitsTable"
                  :tbody-tr-class="'selectable-row'"
                  :items="visits"
                  :fields="visitFields"
                  @row-clicked="expandAdditionalInfo"
                  striped
                  responsive
                >
                  <template slot="row" class="test-class"> </template>
                  <template slot="device" slot-scope="row">
                    {{ row.item.device }}
                  </template>
                  <template slot="what" slot-scope="row">
                    {{ row.item.what }}
                  </template>
                  <template slot="start" slot-scope="row">
                    <div v-if="row.item.events.length > 0">
                      {{ row.item.events[0].start.format("LLL") }}
                    </div>
                  </template>
                  <template slot="end" slot-scope="row">
                    <div v-if="row.item.events.length > 0">
                      {{
                        row.item.events[row.item.events.length - 1].end.format(
                          "LLL"
                        )
                      }}
                    </div>
                  </template>
                  <template slot="events" slot-scope="row">
                    {{ row.item.events.length }}
                  </template>
                  <template slot="row-details" slot-scope="row">
                    <b-card>
                      <b-table
                        :items="row.item.events"
                        :fields="visitEventFields"
                        striped
                        responsive
                        @row-clicked="navigateToRecording"
                      >
                        <template slot="recording" slot-scope="row">
                          {{ row.item.recID }}
                        </template>
                        <template slot="track" slot-scope="row">
                          {{ row.item.trackID }}
                        </template>
                        <template slot="start" slot-scope="row">
                          {{ row.item.start.format("LT") }}
                        </template>
                        <template slot="confidence" slot-scope="row">
                          {{ row.item.confidence }}
                        </template>
                        <template slot="unidentified" slot-scope="row">
                          <div v-if="row.item.wasUnidentified">
                            {{ row.item.wasUnidentified }}
                          </div>
                        </template>
                      </b-table>
                    </b-card>
                  </template>
                </b-table>

                <div v-for="devMap in data" :key="devMap.id">
                  <div v-if="Object.entries(devMap.animals).length > 0">
                    <b-row>
                      <b-col>
                        {{ devMap.deviceName }}
                      </b-col>
                    </b-row>

                    <b-table
                      :items="Object.entries(devMap.animals)"
                      :fields="fields"
                      striped
                      responsive
                    >
                      <template slot="what" slot-scope="row">
                        {{ row.item[0] }}
                      </template>
                      <template slot="start" slot-scope="row">
                        {{ row.item[1].start.format("LLL") }}
                      </template>
                      <template slot="end" slot-scope="row">
                        {{ row.item[1].end.format("LLL") }}
                      </template>
                      <template slot="visits" slot-scope="row">
                        {{ row.item[1].visits.length }}
                      </template>
                    </b-table>
                  </div>
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
          </div>
          <div v-if="countMessage === 'No matches'" class="no-results">
            <h6 class="text-muted">No recordings found</h6>
            <p class="small text-muted">Try modifying your search criteria.</p>
          </div>
        </div>
      </div>
    </b-row>
  </b-container>
</template>
<script lang="ts">
import * as moment from "moment";

import { RecordingInfo } from "../api/Recording.api";
import { DeviceVisits, VisitEvent, DeviceVisitMap } from "../visits";
import DefaultLabels from "../const.js";
import QueryRecordings from "../components/QueryRecordings/QueryRecordings.vue";
import api from "../api/index";
export default {
  name: "VisitsView",
  components: { QueryRecordings },
  props: {},
  data() {
    return {
      searchDescription: null,
      eventMaxTimeSeconds: 60 * 10,
      searchPanelIsCollapsed: true,
      queryPending: false,
      count: null,
      countMessage: null,
      data: {},
      visits: [],
      fields: [
        { key: "what", label: "Animal" },
        { key: "start", label: "First Visit" },
        { key: "end", label: "Last Visit" },
        { key: "visits", label: "Visits" }
      ],
      visitFields: [
        { key: "device", label: "Device" },
        { key: "what", label: "Animal" },
        { key: "start", label: "Visit Start" },
        { key: "end", label: "Visit End" },
        { key: "events", label: "Events" }
      ],
      visitEventFields: [
        { key: "recording", label: "Recording" },
        { key: "track", label: "Track" },
        { key: "start", label: "Event Start" },
        { key: "confidence", label: "Confidence" },
        { key: "unidentified", label: "Assumed" }
      ]
    };
  },
  computed: {
    recordingType: {
      get() {
        return this.$store.state.User.recordingTypePref;
      },
      set(value) {
        this.$store.commit("User/updateRecordingTypePref", value);
      }
    },
    dateRange: {
      get() {
        return this.$store.state.User.analysisDatePref;
      },
      set(value) {
        this.$store.commit("User/updateAnalysisDatePref", value);
      }
    },
    vertical: function() {
      // Change button orientation to vertical on small screen sizes
      return this.width < 576;
    }
  },
  created: async function() {
    await this.$store.dispatch("Devices/GET_DEVICES");
    await this.$store.dispatch("Groups/GET_GROUPS");
  },
  methods: {
    navigateToRecording(event: VisitEvent) {
      this.$router.push({
        path: `recording/${event.recID}/${event.trackID}`
      });
    },
    expandAdditionalInfo(row) {
      this.$refs.visitsTable.clearSelected();
      this.$set(row, "_showDetails", !row._showDetails);
    },
    submitNewQuery(whereQuery) {
      this.getData(whereQuery);
    },
    formatDate: function(momentDate: moment.Moment) {
      return momentDate.format("LLL");
    },

    getData: async function(whereQuery) {
      this.fetching = true;
      // Extract query information
      this.queryPending = true;
      const { result, success } = await api.recording.query(whereQuery);
      this.queryPending = false;
      this.searchDescription = this.$refs.queryRec.searchDescription();
      if (!success) {
        result.messages &&
          result.messages.forEach(message => {
            this.$store.dispatch("Messaging/WARN", message);
          });
        return;
      }
      this.recordings = result.rows;
      this.count = result.count;
      if (result.count > 0) {
        this.countMessage = `${result.count} matches found (total)`;
      } else if (result.count === 0) {
        this.countMessage = "No matches";
      }

      var eventsByDevice = this.calculatVisits(result.rows);
      this.visits = this.visits.filter(function(visit) {
        return (
          visit.events.length > 0 &&
          visit.what != DefaultLabels.allLabels.bird.value &&
          visit.what != DefaultLabels.allLabels.falsePositive.value
        );
      });
      this.visits = this.visits.sort(function(a, b) {
        return a.start < b.start;
      });
      this.data = eventsByDevice;
      console.log(this.data);
    },
    calculatVisits(recordings: RecordingInfo[]): DeviceVisitMap {
      this.visits = [];
      const userID = this.$store.state.User.userData.id;
      const deviceMap: DeviceVisitMap = {};
      for (const rec of recordings) {
        let devVisits = deviceMap[rec.DeviceId];
        if (!devVisits) {
          devVisits = new DeviceVisits(
            rec.Device.devicename,
            rec.DeviceId,
            userID
          );
          deviceMap[rec.DeviceId] = devVisits;
        }
        const newVisits = devVisits.calculateTrackVisits(rec);
        this.visits.push(...newVisits);
      }
      return deviceMap;
    }
  }
};
</script>

<style scoped lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

$main-content-width: 640px;

.selectable-row {
  cursor: pointer;
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

  .search-results {
    max-width: $main-content-width;
    margin: 0 auto;
  }
}
.no-results {
  display: flex;
  flex-flow: column nowrap;
  margin-top: 20vh;
  text-align: center;
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
}
.display-toggle {
  margin-right: 5px;
}
</style>
