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
                    {{ row.item.events[0].start.format("LLL") }}
                  </template>
                  <template slot="end" slot-scope="row">
                    {{
                      row.item.events[row.item.events.length - 1].end.format(
                        "LLL"
                      )
                    }}
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
                        {{ row.item[1].firstVisit.format("LLL") }}
                      </template>
                      <template slot="end" slot-scope="row">
                        {{ row.item[1].lastVisit.format("LLL") }}
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
<script>
import DefaultLabels from "../const.js";
import { mapState } from "vuex";
import QueryRecordings from "../components/QueryRecordings/QueryRecordings.vue";
import moment from "moment";
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
    ...mapState({
      devices: state =>
        state.Devices.devices.map(device => {
          return {
            id: device.id,
            name: device.devicename
          };
        })
    }),
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
    navigateToRecording(event) {
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
    formatDate: function(momentDate) {
      return momentDate.format("LLL");
    },
    getTrackTag: function(trackTags) {
      if (!trackTags || trackTags.length == 0) {
        return null;
      }
      const manualTags = trackTags.filter(tag => tag.automatic == false);
      if (manualTags.length > 0) {
        const userTag = manualTags.find(
          tag => tag.UserId == this.$store.state.User.userData.id
        );
        if (userTag) {
          return userTag;
        } else {
          return manualTags[0];
        }
      }
      return trackTags[0];
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

      this.visits = [];
      var eventsByDevice = this.calculatVisits(result.rows);
      this.visits = this.visits.filter(function(event) {
        return (
          event.tag != DefaultLabels.allLabels.bird.value &&
          event.tag != DefaultLabels.allLabels.falsePositive.value
        );
      });
      this.visits = this.visits.sort(function(a, b) {
        return a.start < b.start;
      });
      this.data = eventsByDevice;
    },
    calculatVisits(recordings) {
      const deviceMap = {};
      for (const rec of recordings) {
        let devVisits = deviceMap[rec.DeviceId];
        if (!devVisits) {
          devVisits = {
            deviceName: rec.Device.devicename,
            id: rec.DeviceId,
            animals: {},
            lastVisit: null
          };
          deviceMap[rec.DeviceId] = devVisits;
        }
        this.calculateTrackVisits(rec, devVisits);
      }
      return deviceMap;
    },
    calculateTrackVisits(rec, devVisits) {
      for (const trackKey in rec.Tracks) {
        const track = rec.Tracks[trackKey];
        this.calculateTrackTagVisit(rec, track, devVisits);
      }
    },
    calculateTrackTagVisit(rec, track, devVisits) {
      const tag = this.getTrackTag(track.TrackTags);
      if (!tag) {
        return;
      }
      let visitSummary;
      const trackPeriod = this.trackStartEnd(rec, track);
      if (tag.what == DefaultLabels.allLabels.unidentified.value) {
        if (this.isPartOfLastVisit(devVisits.lastVisit, trackPeriod.end)) {
          visitSummary = devVisits.animals[devVisits.lastVisit.what];

          this.addEvent(
            visitSummary,
            rec,
            track,
            tag,
            devVisits.lastVisit.what != tag.what
          );
          visitSummary.firstVisit = trackPeriod.end;
          return;
        }
      }
      visitSummary = devVisits.animals[tag.what];
      if (
        visitSummary &&
        this.isPartOfLastVisit(visitSummary.visits[0], trackPeriod.end)
      ) {
        this.addEvent(visitSummary, rec, track, tag);
      } else {
        this.addVisit(devVisits, visitSummary, rec, track, tag);
      }
    },
    recheckUnidentified(devVisits, visit) {
      const unVisit = devVisits.lastVisit;
      if (
        unVisit &&
        unVisit.what == DefaultLabels.allLabels.unidentified.value
      ) {
        console.log(
          "Last visit is unidentified",
          unVisit.what,
          unVisit.start.format("LLL")
        );
        let unEvent = unVisit.events[0];
        let insertIndex = 1;
        while (unEvent && this.isPartOfLastVisit(visit, unEvent.end)) {
          console.log("Adding visit", unEvent.start.format("LLL"));

          visit.events.splice(insertIndex, 0, unEvent);
          insertIndex += 1;
          unEvent.wasUnidentified = true;
          unVisit.events.splice(0, 1);
          unEvent = unVisit.events[0];
        }

        if (unVisit.events.length == 0) {
          const unVisitSummary =
            devVisits.animals[DefaultLabels.allLabels.unidentified.value];
          unVisitSummary.visits.splice(0, 1);
          this.visits.pop();
        }
      }
    },
    trackStartEnd(rec, track) {
      const recTime = moment(rec.recordingDateTime);
      const trackStart = recTime.add(track.start_s * 1000, "milliseconds");
      const trackEnd = recTime.add(track.end_s * 1000, "milliseconds");
      return { start: trackStart, end: trackEnd, recStart: recTime };
    },
    addEvent(visitSummary, rec, track, tag, wasUnidentified = false) {
      //add event to current visit
      const lastVisit = visitSummary.visits[0];
      const event = this.newEvent(rec, track, tag, wasUnidentified);
      lastVisit.events.splice(0, 0, event);
      lastVisit.start = event.start;
      visitSummary.firstVisit = event.end;
    },
    newEvent(rec, track, tag, wasUnidentified = false) {
      const trackTimes = this.trackStartEnd(rec, track);
      return {
        wasUnidentified: wasUnidentified,
        recID: rec.id,
        recStart: trackTimes.recStart,
        trackID: track.id,
        confidence: tag.confidence,
        start: trackTimes.start,
        end: trackTimes.end
      };
    },
    addVisit(devVisits, visitSummary, rec, track, tag) {
      const visit = this.newVisit(rec, track, tag, devVisits.deviceName);

      if (!visitSummary) {
        visitSummary = this.newVisitSummary(visit);
        devVisits.animals[visit.what] = visitSummary;
      }
      visitSummary.currentEvent += 1;
      visit.eventId = visitSummary.currentEvent;
      visitSummary.visits.splice(0, 0, visit);
      visitSummary.firstVisit = visit.end;
      if (visit.what != DefaultLabels.allLabels.unidentified.value) {
        this.recheckUnidentified(devVisits, visit);
      }
      devVisits.lastVisit = visit;
      this.visits.push(visit);
      return visit;
    },
    isPartOfLastVisit(lastVisit, newEnd) {
      if (!lastVisit) {
        return false;
      }
      const secondsDiff = Math.abs(lastVisit.start.diff(newEnd, "seconds"));
      return secondsDiff <= this.eventMaxTimeSeconds;
    },
    newVisitSummary(visit) {
      return {
        what: visit.what,
        visits: [],
        currentEvent: 0,
        lastVisit: visit.start,
        firstVisit: visit.end
      };
    },
    newVisit(rec, track, tag, deviceName) {
      const event = this.newEvent(rec, track, tag);

      return {
        eventId: 1,
        events: [event],
        what: tag.what,
        end: event.end,
        start: event.start,
        device: deviceName
      };
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
