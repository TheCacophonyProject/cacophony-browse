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
          :onlyRecordingType="'video'"
          :path="'visits'"
          :is-collapsed="searchPanelIsCollapsed"
          @submit="submitNewQuery"
          @toggled-search-panel="
            searchPanelIsCollapsed = !searchPanelIsCollapsed
          "
        />
      </div>
      <div :class="['search-content-wrapper']">
        <b-alert
          v-model="showInfo"
          variant="info"
          dismissible
          @dismissed="infoDismissed"
        >
          {{ infoMessage }}
        </b-alert>

        <div class="search-results">
          <div class="results-summary">
            <div style="display:flex;">
              <h1 style="flex-grow: 100;">Visits</h1>
              <div style="align-self: flex-end;">
                <CsvDownload :params="getQuery()" :visits="true" />
                <b-button variant="link" @click="showInfo = true">
                  <font-awesome-icon icon="question-circle" size="sm" />
                  Help</b-button
                >
              </div>
            </div>
            <h2 v-if="countMessage">
              {{ countMessage }}
            </h2>
            <h5 v-else>
              Loading...
            </h5>
            <p class="search-description" v-html="searchDescription"></p>
            <div v-if="!queryPending" class="results">
              <h1>Visit Summary Per Device</h1>
              <div class="scrollable">
                <div v-for="devMap in deviceVisits" :key="devMap.id">
                  <div v-if="Object.entries(devMap.animals).length > 0">
                    <b-row>
                      <b-col>
                        <h2>
                          {{ devMap.deviceName }}
                        </h2>
                      </b-col>
                    </b-row>
                    <b-table
                      class="device-table"
                      :items="Object.entries(devMap.animals)"
                      :fields="fields"
                      striped
                    >
                      <template v-slot:cell(what)="row">
                        {{ row.item[0] }}
                      </template>
                      <template v-slot:cell(start)="row">
                        {{ formatDate(row.item[1].start, tableDateTimeFormat) }}
                      </template>
                      <template v-slot:cell(end)="row">
                        {{ formatDate(row.item[1].end, tableDateTimeFormat) }}
                      </template>
                      <template v-slot:cell(visits)="row">
                        {{ row.item[1].visits.length }}
                      </template>
                    </b-table>
                  </div>
                </div>
              </div>
              <div v-if="visits.length > 0" class="scrollable">
                <div
                  v-for="(dayVisits, index_a) in visitsByDayAndHour"
                  :key="index_a"
                >
                  <h4 class="recordings-day">
                    <div class="event-recording">
                      <span v-if="dayVisits.audioBaitDay">
                        <font-awesome-icon icon="volume-up" size="xs" />
                      </span>
                      {{ dayVisits.relativeDay() }}
                    </div>
                  </h4>
                  <div
                    v-for="(hourVisits, index_b) in dayVisits.visitsByHour"
                    :key="index_b"
                  >
                    <h5 class="recordings-hour">{{ hourVisits.getHour() }}</h5>
                    <b-table
                      class="visits-table"
                      :items="hourVisits.visits"
                      :fields="visitFields"
                      @row-clicked="expandAdditionalInfo"
                      striped
                    >
                      <template v-slot:cell(what)="row">
                        <span class="audio-bait" v-if="row.item.audioBaitVisit">
                          <font-awesome-icon icon="volume-up" size="xs" />
                        </span>
                        <div class="what-image">
                          <img
                            v-if="whatImage(row.item)"
                            :src="whatImage(row.item)"
                            class="tag-img"
                          />
                          {{ row.item.what }}
                        </div>
                      </template>
                      <template v-slot:cell(device)="row">
                        <div class="device-cell">
                          {{ row.item.deviceName }}
                        </div>
                      </template>
                      <template v-slot:cell(date)="deviceVisits">
                        {{
                          formatDate(
                            deviceVisits.item.events[
                              deviceVisits.item.events.length - 1
                            ].start,
                            tableDateFormat
                          )
                        }}
                      </template>

                      <template v-slot:cell(start)="row">
                        {{
                          formatDate(
                            row.item.events[row.item.events.length - 1].start,
                            tableTimeFormat
                          )
                        }}
                      </template>
                      <template v-slot:cell(end)="row">
                        {{
                          formatDate(row.item.events[0].end, tableTimeFormat)
                        }}
                      </template>
                      <template v-slot:cell(events)="row">
                        {{ row.item.events.length }}
                      </template>
                      <template slot="row-details" slot-scope="row">
                        <div
                          v-for="(visitEvents, index_e) in sortEventsByRec(
                            row.item
                          )"
                          :key="index_e"
                          class="rec-events"
                        >
                          <div class="event-recording">
                            <font-awesome-icon
                              :icon="['far', 'file-video']"
                              size="xs"
                            />
                            {{
                              formatDate(
                                visitEvents.recStart,
                                tableDateTimeFormat
                              )
                            }}
                          </div>
                          <b-container>
                            <div
                              v-for="(item, index) in visitEvents.events"
                              :key="index"
                            >
                              <AudioSummary
                                v-if="isAudioBait(item)"
                                :item="item"
                              />
                              <EventSummary
                                v-else
                                :item="item"
                                :trackNumber="
                                  visitEvents.tracks - item.trackNumber
                                "
                                :key="index"
                                :what="row.item.what"
                              />
                            </div>
                          </b-container>
                        </div>
                      </template>
                    </b-table>
                  </div>
                </div>
              </div>
              <div class="load-more">
                <div v-if="loadingMore">
                  Loading...
                </div>
                <div v-else>
                  <b-button v-if="canLoadMore" @click="loadMoreVisits()">
                    <span v-if="loadingMore">
                      Loading...
                    </span>
                    <span v-else>
                      {{ loadText }}
                    </span>
                  </b-button>
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
          <div v-if="countMessage === 'No visits'" class="no-results">
            <h6 class="text-muted">No recordings found</h6>
            <p class="small text-muted">Try modifying your search criteria.</p>
          </div>
        </div>
      </div>
    </b-row>
  </b-container>
</template>
<script lang="ts">
/* global require */
import * as moment from "moment";
import { Visit, DayVisits } from "../api/visits";
import DefaultLabels from "../const.js";
import EventSummary from "../components/EventSummary.vue";
import AudioSummary from "../components/AudioBaitSummary.vue";
import CsvDownload from "../components/QueryRecordings/CsvDownload.vue";
import QueryRecordings from "../components/QueryRecordings/QueryRecordings.vue";
import api from "../api/index";
export default {
  name: "VisitsView",
  components: { QueryRecordings, EventSummary, AudioSummary, CsvDownload },
  data() {
    return {
      showInfo: this.isInfoShown(),
      infoMessage: `A "visit" is multiple thermal video tracks that have been combined because they are likely to be due to the appearance of a single animal. Each visit can be expanded by clicking on it to show the tracks which it is made up from.`,
      tableDateTimeFormat: "L LTS",
      tableDateFormat: "DD MMM",
      tableTimeFormat: "LTS",
      searchDescription: null,
      eventMaxTimeSeconds: 60 * 10,
      searchPanelIsCollapsed: true,
      queryPending: false,
      count: null,
      countMessage: null,
      deviceVisits: {},
      visits: [],
      loadingMore: false,
      fields: [
        { key: "what", label: "Animal" },
        { key: "start", label: "First Visit" },
        { key: "end", label: "Last Visit" },
        { key: "visits", label: "Visits" }
      ],
      visitFields: [
        {
          key: "what",
          label: ""
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
      ],
      offset: 0,
      loadText: "Load More Visits",
      canLoadMore: true,
      visitLimit: 300
    };
  },
  computed: {
    visitsByDayAndHour() {
      const visitsByDay = [];
      let currentDay = null;

      for (const item of this.visits) {
        if (!currentDay || !currentDay.isSameDay(item)) {
          currentDay = new DayVisits(item);
          visitsByDay.push(currentDay);
        } else {
          currentDay.addVisit(item);
        }
      }
      return visitsByDay;
    }
  },
  methods: {
    formatDate(date: string, formatStr: string): string {
      return moment(date).format(formatStr);
    },
    isInfoShown() {
      return localStorage.getItem("visitInfo") != "0";
    },
    infoDismissed() {
      localStorage.setItem("visitInfo", "0");
    },
    isAudioBait(event: any) {
      return event.hasOwnProperty("DeviceId");
    },
    // sorts in descending order visit events (audio bait and tracks) grouped by recordings
    sortEventsByRec(visit: Visit) {
      const eventsByRec = [];
      let recEvent;
      let recID;

      var audioBaitEvents = visit.audioBaitEvents.slice();
      audioBaitEvents.sort(function(a, b) {
        return moment(a.dateTime) > moment(b.dateTime) ? 1 : -1;
      });
      let audioevent = audioBaitEvents.pop();
      let audioTime;
      if (audioevent) {
        audioTime = moment(audioevent.dateTime);
      }
      let audioBaitBefore = false;
      let trackNum = 0;

      for (const item of visit.events) {
        audioBaitBefore = audioTime && audioTime.isAfter(moment(item.start));
        // new recording
        if (!recID || item.recID != recID) {
          recID = item.recID;
          recEvent = { recStart: item.recStart, tracks: 0, events: [] };
          eventsByRec.push(recEvent);
          trackNum = 0;
        }

        // add all audio bait events before this recording
        while (audioBaitBefore) {
          recEvent.events.push(audioevent);
          audioevent = audioBaitEvents.pop();
          audioTime = null;
          if (audioevent) {
            audioTime = moment(audioevent.dateTime);
          }
          audioBaitBefore = audioTime && audioTime.isAfter(moment(item.start));
        }
        item.trackNumber = trackNum;
        recEvent.events.push(item);
        recEvent.tracks += 1;
        trackNum += 1;
      }

      // add remaining events
      if (audioevent) {
        audioBaitEvents.push(audioevent);
      }
      recEvent.events.splice(recEvent.events.length, 0, ...audioBaitEvents);
      return eventsByRec;
    },

    whatImage: function(visit: Visit) {
      let image = null;
      if (visit.what == DefaultLabels.allLabels.kiwi.value) {
        image = "kiwi.png";
      } else {
        image = visit.what + ".png";
      }

      try {
        const link = require("../assets/video/" + image);
        return link.default;
      } catch (e) {
        return;
      }
    },
    expandAdditionalInfo(row) {
      this.$set(row, "_showDetails", !row._showDetails);
    },
    getQuery() {
      if (this.$refs.queryRec) {
        return this.$refs.queryRec.getQuery(true);
      }
      return {};
    },
    submitNewQuery(whereQuery) {
      this.getVisits(whereQuery, true);
    },
    loadMoreVisits() {
      this.loadingMore = true;
      const query = this.getQuery();
      query["offset"] = this.offset;
      this.getVisits(query, false);
      this.loadingMore = false;
    },
    getVisits: async function(whereQuery, newQuery: boolean) {
      // Extract query information
      if (newQuery) {
        this.offset = 0;
        this.queryPending = true;
      }

      whereQuery["limit"] = this.visitLimit;
      const { result, success } = await api.recording.queryVisits(whereQuery);
      this.searchDescription = this.$refs.queryRec.searchDescription();
      if (!success) {
        result.messages &&
          result.messages.forEach(message => {
            this.$store.dispatch("Messaging/WARN", message);
          });
        return;
      }
      if (newQuery) {
        this.countMessage = "No Visits";
        this.visits = [];
        this.deviceVisits = result.rows;
        this.offset = 0;
        this.canLoadMore = true;
        this.queryPending = false;
      }
      this.processVisits(result, !newQuery);
    },
    processVisits(result, mergeResults: boolean) {
      if (result.numRecordings == 0) {
        this.canLoadMore = false;
        return;
      }
      const eventsByDevice = result.rows;
      if (mergeResults) {
        this.count += result.numVisits;
      } else {
        this.count = result.numVisits;
      }
      this.offset = result.queryOffset;
      this.canLoadMore = result.hasMoreVisits;
      if (this.count > 0) {
        this.countMessage = `${this.count} visits found (total)`;
      } else if (this.count === 0) {
        this.countMessage = "No visits";
      }

      for (const devId in eventsByDevice) {
        let merged = false;
        const animalMap = eventsByDevice[devId].animals;
        if (mergeResults && !(devId in this.deviceVisits)) {
          this.deviceVisits[devId] = eventsByDevice[devId];
          merged = true;
        }

        const existingAnimalMap = this.deviceVisits[devId].animals;
        for (const animal in animalMap) {
          const filtered = animalMap[animal].visits.filter(this.filterVisit);
          this.visits.push(...filtered);

          // merge new visits with old device visits
          if (mergeResults && !merged) {
            if (!(animal in existingAnimalMap)) {
              existingAnimalMap[animal] = animalMap[animal];
            } else {
              existingAnimalMap[animal].visits.push(
                ...animalMap[animal].visits
              );
              existingAnimalMap[animal].start = animalMap[animal].start;
            }
          }
        }
      }
      this.visits = this.visits.sort(function(a, b) {
        if (a.start == b.start) {
          return a.id - b.id;
        }
        return a.start < b.start ? 1 : -1;
      });
    },
    filterVisit(visit: Visit): boolean {
      return (
        visit.events.length > 0 &&
        visit.what != DefaultLabels.allLabels.bird.value &&
        visit.what != DefaultLabels.allLabels.falsePositive.value
      );
    }
  }
};
</script>

<style lang="scss">
.b-table-details {
  background-color: white !important;
  curosr: default;
}

.visits-table > tbody > tr td:first-child {
  position: relative;
}

.visits-table > tbody > tr td:first-child {
  position: relative;
}

.visits-table table > tbody > tr:not(.b-table-details) {
  cursor: pointer;
  height: 48px;
}
</style>

<style scoped lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

$main-content-width: 640px;

.device-cell {
  width: 151px;
  height: 28px;
  overflow-x: hidden;
  overflow-y: hidden;
}

@include media-breakpoint-down(sm) {
  .scrollable {
    max-width: calc(100vw - 3em);
    overflow: auto;
  }

  .device-table {
    min-wdith: 640px;
  }

  .visits-table {
    min-width: 640px;
  }
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

  .rec-events {
    margin-top: 2px;
    margin-bottom: 2px;
  }

  .recordings-hour {
    position: sticky;
    font-size: 0.9em;
    font-weight: 600;
  }

  .recordings-day {
    position: sticky;
    top: 0;
    background: transparentize($white, 0.15);
    padding: 0.5rem 0;
    font-size: 1em;
    font-weight: 600;
  }

  @include media-breakpoint-down(sm) {
    .recordings-hour {
      padding: 0.7rem 0;
      float: left;
    }
  }

  @include media-breakpoint-up(sm) {
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
  }
}

.no-results {
  display: flex;
  flex-flow: column nowrap;
  margin-top: 20vh;
  text-align: center;
}

.search-filter-wrapper {
  background: $gray-100;
  position: relative;
  border-right: 1px solid $gray-200;
}

@include media-breakpoint-down(md) {
  .search-filter-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    transform: translate(0);
    width: var(--search-panel-width);
    z-index: 2;
    transition: transform 0.2s;
    &.is-collapsed {
      transform: translate(var(--search-panel-offset));
    }
  }
}

.what-image {
  display: inline-block;
  margin-left: 0.4rem;
}

.tag-img {
  max-width: 30px;
  max-height: 30px;
  margin-right: 0.2rem;
}

.audio-bait {
  position: absolute;
  top: 0px;
  left: 4px;
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

.load-more {
  margin-bottom: 0;
  text-align: center;
  justify-content: center;
}
</style>
