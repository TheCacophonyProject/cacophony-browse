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
          :path="'visits'"
          :is-collapsed="searchPanelIsCollapsed"
          @submit="submitNewQuery"
          @toggled-search-panel="
            searchPanelIsCollapsed = !searchPanelIsCollapsed
          "
        />
      </div>
      <div :class="['search-content-wrapper']">
        <div class="search-results">
          <div class="results-summary">
            <div class="float-right">
              <h1>Visits</h1>
              <h2 v-if="countMessage">
                {{ countMessage }}
              </h2>
              <h5 v-else>
                Loading...
              </h5>
              <p class="search-description" v-html="searchDescription"></p>
            </div>
            <div v-if="!queryPending" class="results">
              <b-table :items="visits" :fields="visitFields" striped responsive>
                <template slot="device" slot-scope="row">
                  {{ row.item.device }}
                </template>
                <template slot="what" slot-scope="row">
                  {{ row.item.what }}
                </template>
                <template slot="start" slot-scope="row">
                  {{ row.item.start.format("LLL") }}
                </template>
                <template slot="end" slot-scope="row">
                  {{ row.item.end.format("LLL") }}
                </template>
                <template slot="events" slot-scope="row">
                  {{ row.item.tags.length }}
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

      var eventsByDevice = this.calculatVisits(result.rows);
      this.visits = this.visits.filter(function(event) {
        return event.tag != "bird" && event.tag != "false-positive";
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
            animals: {}
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
      const visit = this.newVisit(rec, track, tag, devVisits.deviceName);
      let visitSummary = devVisits.animals[tag.what];
      if (!visitSummary) {
        visitSummary = {
          animal: tag.what,
          visits: [],
          currentEvent: 1,
          lastVisit: visit.start,
          firstVisit: visit.end
        };
        visitSummary.visits.push(visit);
        devVisits.animals[tag.what] = visitSummary;
        this.visits.push(visit);
      } else {
        const secondsDiff = visitSummary.firstVisit.diff(visit.end, "seconds");

        if (secondsDiff > this.eventMaxTimeSeconds) {
          //new visit
          visitSummary.currentEvent += 1;
          visit.event = visitSummary.currentEvent;
          visitSummary.visits.splice(0, 0, visit);
          this.visits.push(visit);
        } else {
          //add event to current visit
          const existingVisit = visitSummary.visits[0];
          existingVisit.tags.splice(0, 0, tag);
          existingVisit.start = visit.start;
        }
        visitSummary.firstVisit = visit.end;
      }
    },
    newVisit(rec, track, tag, deviceName) {
      const recTime = moment(rec.recordingDateTime);
      const trackStart = recTime.add(track.start_s * 1000, "milliseconds");
      const trackEnd = recTime.add(track.end_s * 1000, "milliseconds");
      return {
        event: 1,
        tags: [tag],
        what: tag.what,
        end: trackEnd,
        start: trackStart,
        device: deviceName
      };
    }
  }
};
</script>
