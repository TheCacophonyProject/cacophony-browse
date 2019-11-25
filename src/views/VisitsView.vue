<template>
  <b-container fluid style="display:flex">
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
              <div
                v-for="(itemsByDay, index_a) in visitsByDayAndHour"
                :key="index_a"
              >
                <h4 class="recordings-day">{{ relativeDay(itemsByDay) }}</h4>
                <div
                  v-for="(itemsByHour, index_b) in itemsByDay"
                  :key="index_b"
                >
                  <h5 class="recordings-hour">{{ hour(itemsByHour) }}</h5>

                  <b-table
                    class="visits-table"
                    :items="itemsByHour"
                    :fields="visitFields"
                    @row-clicked="expandAdditionalInfo"
                    striped
                    responsive
                  >
                    <template slot="what" slot-scope="row">
                      <div class="what-image">
                        <img
                          v-if="whatImage(row.item)"
                          :src="whatImage(row.item)"
                          class="tag-img"
                        />
                        {{ row.item.what }}
                      </div>
                    </template>
                    <template slot="device" slot-scope="row">
                      <div class="device-cell">
                        {{ row.item.device }}
                      </div>
                    </template>
                    <template slot="date" slot-scope="row">
                      {{ row.item.events[0].start.format(tableDateFormat) }}
                    </template>

                    <template slot="start" slot-scope="row">
                      {{ row.item.events[0].start.format(tableTimeFormat) }}
                    </template>
                    <template slot="end" slot-scope="row">
                      {{
                        row.item.events[row.item.events.length - 1].end.format(
                          tableTimeFormat
                        )
                      }}
                    </template>
                    <template slot="events" slot-scope="row">
                      {{ row.item.events.length }}
                    </template>
                    <template slot="row-details" slot-scope="row">
                      <div
                        v-for="(visitEvents, index_e) in eventsByRec(
                          row.item.events
                        )"
                        :key="index_e"
                        class="rec-events"
                      >
                        <div class="event-recording">
                          <font-awesome-icon
                            :icon="['far', 'file-video']"
                            size="1x"
                          />
                          {{
                            visitEvents[0].recStart.format(tableDateTimeFormat)
                          }}
                        </div>
                        <EventSummary
                          v-for="(item, index) in visitEvents"
                          :item="item"
                          :trackNumber="index + 1"
                          :key="index"
                        />
                      </div>
                    </template>
                  </b-table>
                </div>
              </div>

              <h1>Visit Summary Per Device</h1>
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
                      {{ row.item[1].start.format(tableDateTimeFormat) }}
                    </template>
                    <template slot="end" slot-scope="row">
                      {{ row.item[1].end.format(tableDateTimeFormat) }}
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
  </b-container>
</template>
<script lang="ts">
import * as moment from "moment";

import { RecordingInfo } from "../api/Recording.api";
import { DeviceVisits, VisitEvent, DeviceVisitMap, Visit } from "../visits";
import DefaultLabels from "../const.js";
import EventSummary from "../components/EventSummary.vue";
import QueryRecordings from "../components/QueryRecordings/QueryRecordings.vue";
import api from "../api/index";
export default {
  name: "VisitsView",
  components: { QueryRecordings, EventSummary },
  props: {},
  data() {
    return {
      tableDateTimeFormat: "L LTS",
      tableDateFormat: "L",
      tableTimeFormat: "LTS",
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
        {
          key: "what",
          label: "",
          thStyle: { display: "none" }
        },
        { key: "device", label: "Device" },
        { key: "date", label: "Date" },
        { key: "start", label: "Visit Start" },
        { key: "end", label: "End" },
        { key: "events", label: "#" }
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
    visitsByDayAndHour() {
      const visitsByDay = [];
      let visitsByHour = [];
      let hourVisits = [];
      let current = null;
      for (const item of this.visits) {
        const thisItem = {
          date: item.end,
          dayDate: item.end.format("YYYY-MM-DD"),
          hour: item.end.format("HH")
        };

        if (!current || thisItem.dayDate != current.dayDate) {
          visitsByHour = [];
          visitsByDay.push(visitsByHour);
          hourVisits = [];
          visitsByHour.push(hourVisits);
          current = thisItem;
        } else if (thisItem.hour != current.hour) {
          hourVisits = [];
          visitsByHour.push(hourVisits);
          current = thisItem;
        }
        hourVisits.push(item);
      }
      return visitsByDay;
    },
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
    eventsByRec(visitEvents: VisitEvent[]) {
      const eventsByRec = [];
      let recEvent;
      let recID;
      for (const item of visitEvents) {
        if (!recID || item.recID != recID) {
          recID = item.recID;
          recEvent = [];
          eventsByRec.push(recEvent);
        }
        recEvent.push(item);
      }
      return eventsByRec;
    },
    relativeDay(days) {
      return days[0][0].end.format("YYYY-MM-DD");
    },
    hour(hours) {
      return hours[0].end.format("ha");
    },
    whatImage: function(visit: Visit) {
      let image = null;
      if (visit.what == DefaultLabels.allLabels.kiwi.value) {
        image = "kiwi.png";
      } else {
        image = visit.what + ".png";
      }
      try {
        return require("../assets/video/" + image);
      } catch (e) {
        return;
      }
    },
    navigateToRecording(event: VisitEvent) {
      this.$router.push({
        path: `recording/${event.recID}/${event.trackID}`
      });
    },
    expandAdditionalInfo(row) {
      this.$set(row, "_showDetails", !row._showDetails);
    },
    submitNewQuery(whereQuery) {
      this.getData(whereQuery);
    },
    formatDate: function(momentDate: moment.Moment) {
      return momentDate.format("ll");
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
<style lang="scss">
.visits-table > table > thead {
  display: none;
}

.visits-table > table > tbody > tr td:first-child {
  padding: 0 0.75rem 0 0.75rem;
  vertical-align: middle;
  width: 138px;
}

.device-cell {
  width: 151px;
  height: 28px;
  overflow-x: hidden;
  overflow-y: hidden;
}

.visits-table table > tbody > tr:not(.b-table-details) {
  cursor: pointer;
  height: 48px;
}

.visits-table .b-table-details {
  background-color: white !important;
  curosr: default;
}
</style>

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

  .search-results {
    max-width: $main-content-width;
    margin: 0 auto;
  }

  .rec-events {
    margin-top: 2px;
    margin-bottom: 2px;
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
  .event-recording {
    padding: 0.5rem 0;
    font-size: 1em;
    font-weight: 600;
    border-bottom: 1px solid $gray-200;
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

.tag-img {
  max-width: 30px;
  max-height: 30px;
  margin-right: 0.2rem;
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
