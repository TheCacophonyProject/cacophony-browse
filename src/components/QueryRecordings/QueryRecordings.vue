<template>
  <div :class="['query-recordings', { 'is-collapsed': isCollapsed }]">
    <b-button
      :class="['search-panel-toggle-btn', { 'is-collapsed': isCollapsed }]"
      variant="primary"
      @click="() => toggleSearchPanel()"
    >
      <span v-if="isCollapsed">
        <font-awesome-icon :icon="['fas', 'search']" />
        <span class="sr-only">Expand search panel</span>
      </span>
      <span v-else>
        <font-awesome-icon :icon="['fas', 'times']" />
        <span class="sr-only">Collapse search panel</span>
      </span>
    </b-button>
    <b-form-group>
      <h2>Search recordings</h2>
      <SelectDevice
        :selected-devices="selectedDevices"
        :selected-groups="selectedGroups"
        @update-device-selection="updateDeviceSelection"
      />
      <div v-if="!onlyRecordingType">
        <SelectRecordingType v-model="recordingType" />
      </div>
      <SelectDateRange 
        :dateData="dates" 
        @update-dates="updateDates"
        @update-date-description="updateDateDescription"/>
      <b-form-row>
        <b-col>
          <b-button
            variant="link"
            class="toggle-advanced-search-btn"
            @click="() => toggleAdvancedSearch()"
          >
            Advanced search
            <font-awesome-icon v-if="!advanced" :icon="['fas', 'caret-down']" />
            <font-awesome-icon v-else :icon="['fas', 'caret-up']" />
          </b-button>
        </b-col>
      </b-form-row>
      <SelectDuration v-if="advanced" v-model="duration" />
      <SelectTagTypes v-if="advanced" v-model="tagTypes" :disabled="isAudio" />
      <SelectAnimal
        v-if="advanced"
        v-model="animals"
        :disabled="isAudio"
        :can-have-sub-tags="canHaveTags"
      />
      <b-button
        :disabled="!isCustomDateRangeAndRangeIsValid || disabled"
        block
        variant="primary"
        @click="submit"
      >
        <span v-if="!disabled">Search</span>
        <span v-else>Searching...</span>
      </b-button>
    </b-form-group>
  </div>
</template>

<script>
import moment from "moment";
import DefaultLabels from "../../const.js";
import SelectDevice from "./SelectDevice.vue";
import SelectTagTypes from "./SelectTagTypes.vue";
import SelectAnimal from "./SelectAnimal.vue";
import SelectDuration from "./SelectDuration.vue";
import SelectDate from "./SelectDate.vue";
import SelectRecordingType from "./SelectRecordingType.vue";
import SelectDateRange from "./SelectDateRange.vue";
import Vue from "vue";

export default {
  name: "QueryRecordings",
  components: {
    SelectDateRange,
    SelectDevice,
    SelectTagTypes,
    SelectAnimal,
    SelectDuration,
    SelectDate,
    SelectRecordingType
  },
  props: {
    disabled: {
      type: Boolean,
      required: true
    },
    isCollapsed: {
      type: Boolean,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    currentPage: {
      type: Number,
      required: false
    },
    perPage: {
      type: Number,
      required: false
    },
    onlyRecordingType: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      lastQuery: null,
      query: this.resetQuery(),
      rawAnimals: [],
      hasSpecifiedTags: false,
      canHaveTags: false,
      isAudio: true,
      advanced: false,
      loadedQuery: false,
      isCustomDateRange: false,
      selectedDevices: [],
      selectedGroups: [],
      dates: {days: "3"},
      dateDescription: ""
    };
  },
  computed: {
    recordingType: {
      get() {
        if (this.onlyRecordingType) {
          return this.onlyRecordingType;
        }
        return (
          this.query.where.type ||
          this.$store.state.User.recordingTypePref ||
          "both"
        );
      },
      set(value) {
        this.query.where.type = value;
        // If it is an audio recording, then animals and tag types should be
        // disabled as these filters do not apply to audio recordings
        this.isAudio = value !== "video";
      }
    },
    duration: {
      get() {
        const duration = this.query.where.duration;
        return {
          low: duration["$gte"],
          high: duration["$lte"]
        };
      },
      set(value) {
        this.query.where.duration["$gte"] = value.low;
        this.query.where.duration["$lte"] = value.high;
      }
    },
    tagTypes: {
      get() {
        return this.query.tagMode;
      },
      set(value) {
        this.query.tagMode = value;
        this.canHaveTags = this.canHaveSpecifiedTags(value);
        if (!this.canHaveTags) {
          this.animals = [];
        }
      }
    },
    animals: {
      get() {
        return this.rawAnimals;
      },
      set(value) {
        this.rawAnimals = value;
        this.query.tags = value.map(option =>
          option.value ? option.value : option.text
        );
        this.hasSpecifiedTags = this.rawAnimals > 0;
        if (this.hasSpecifiedTags) {
          if (!this.canHaveTags) {
            this.tagTypes = "tagged";
          }
        }
      }
    },
    groups: function() {
      return this.$store.state.Groups;
    },
    isCustomDateRangeAndRangeIsValid: function() {
      return (
        !this.isCustomDateRange ||
        (this.isCustomDateRange &&
          this.query.where.recordingDateTime["$gt"] !== "" &&
          this.query.where.recordingDateTime["$lt"] !== "")
      );
    }
  },
  watch: {
    isAudio: function() {
      if (this.isAudio) {
        // Reset any existing filters for animals and tag types when searching
        // for audio recordings
        this.animals = [];
        this.tagTypes = "any";
      }
    },
    $route() {
      // FIXME(jon): Back buttons with pagination is currently broken.

      const queryHasChanged =
        JSON.stringify(this.lastQuery) !== JSON.stringify(this.query);
      if (queryHasChanged) {
        this.parseCurrentRoute(false);
      }
      this.$emit("submit", this.serialiseQuery(this.query, true));
    }
  },
  mounted() {
    this.isAudio = this.recordingType === "audio";
    this.parseCurrentRoute();
    this.saveLastQuery();
    this.$emit("submit", this.serialiseQuery(this.query, true));
  },
  updated() {
    if (!this.loadedQuery) {
      this.loadedQuery = true;
      // If there was an advanced query, start with the advanced toggle area open.
      this.advanced =
        this.query.tags.length !== 0 ||
        this.query.tagMode !== "any" ||
        (this.query.where && this.query.where.duration.hasOwnProperty("$lte"));
      this.canHaveTags = this.canHaveSpecifiedTags(this.query.tagMode);
      this.animals = this.query.tags.map(tag =>
        DefaultLabels.searchLabels().find(({ value }) => tag === value)
      );
    }
  },
  methods: {
    saveLastQuery() {
      this.lastQuery = JSON.parse(JSON.stringify(this.query));
    },
    updatePagination(perPage, page) {
      this.query.limit = perPage;
      const newOffset = Math.max(0, (page - 1) * perPage);
      this.query.offset = newOffset;
      this.updateRouteQuery();
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
        if (!target.where.duration) {
          this.$set(target.where, "duration", {});
        }
      }
      if (routeQuery.tags) {
        target.tags = JSON.parse(routeQuery.tags);
      }

      this.dates = {
        days: routeQuery.days,
        toDate: routeQuery.toDate,
        fromDate: routeQuery.fromDate
      }
      if (routeQuery.hasOwnProperty("groups")) {
        this.selectedGroups = JSON.parse(routeQuery.groups);
      }
      if (routeQuery.hasOwnProperty("devices")) {
        this.selectedDevices = JSON.parse(routeQuery.devices);
      }
    },
    parseCurrentRoute(addState = true) {
      if (Object.keys(this.$route.query).length === 0) {
        // Populate the url params if we got here without them, ie. /recordings
        this.query = this.resetQuery();
        if (addState) {
          this.updateRouteQuery();
        }
      }
      this.deserialiseRouteIntoQuery(this.$route.query);
    },
    updateRouteQuery() {
      // Update the url query params string so that this search can be easily shared.
      this.saveLastQuery();
      this.$router.push({
        path: this.path,
        query: this.serialiseQuery(this.query)
      });
    },
    getQuery(useForApiCall = false) {
      return this.serialiseQuery(this.query, useForApiCall);
    },
    submit: function() {
      if (!this.onlyRecordingType) {
        this.$store.commit("User/updateRecordingTypePref", this.recordingType);
      }

      // Every time we submit a new query, we need to clear the offset param, as if we are on page 2+ of the results,
      // we can end up with an offset that is greater than the number of results in the new query.
      Vue.delete(this.query, "offset");
      this.updateRouteQuery();
      this.toggleSearchPanel();
    },
    canHaveSpecifiedTags: DefaultLabels.canHaveSpecifiedTags,
    toggleAdvancedSearch: function() {
      this.advanced = !this.advanced;
    },
    toggleSearchPanel: function() {
      this.$emit("toggled-search-panel");
    },
    resetQuery() {
      return {
        where: {
          duration: {
            $gte: "0",
            $lte: ""
          },
          recordingDateTime: {
            $gt: "",
            $lt: ""
          }
        },
        tagMode: "any",
        tags: [],
        type: ""
      };
    },
    formatQueryDate(date) {
      return moment(date).format("YYYY-MM-DD HH:mm:ss");
    },
    addIfSet(map, value, submap, key) {
      if (value && value.trim() !== "") {
        map[submap] = map[submap] || {};
        map[submap][key] = value;
      }
    },
    serialiseQuery(query, useForApiCall = false) {
      if (!query) {
        return {};
      }
      const where = {};
      if (this.onlyRecordingType) {
        where.type = this.onlyRecordingType;
      } else {
        where.type =
          query.where.type || this.$store.state.User.recordingTypePref;
      }
      this.addIfSet(where, query.where.duration["$gte"], "duration", "$gte");
      this.addIfSet(where, query.where.duration["$lte"], "duration", "$lte");

      if (useForApiCall) {
        // Map between the mismatch in video type types between frontend and backend
        if (where.type === "video") {
          where.type = "thermalRaw";
        } else if (where.type === "both") {
          delete where.type;
        }
        // Remove the group param, since the API doesn't handle that, we're just using
        // it to accurately share search parameters via urls.
        delete where.dateRange;

        if (this.selectedDevices.length > 0 && this.selectedGroups.length > 0) {
          where["Op.or"] = [
            { DeviceId: this.selectedDevices },
            { GroupId: this.selectedGroups }
          ];
        } else if (this.selectedGroups.length > 0) {
          where.GroupId = this.selectedGroups;
        } else if (this.selectedDevices.length > 0) {
          where.DeviceId = this.selectedDevices;
        }
    
        let from = this.dates.from;
        let until = this.dates.to; 
        if (this.dates.hasOwnProperty("days") && this.dates.days !== "") {
          // We must do this at the time the button is pushed
          const now = new Date();
          from = this.formatQueryDate(moment(now).add(this.dates.days, "days"));
        } 
        if (from || until) {
          where.recordingDateTime = {};
          if (from) {
            where.recordingDateTime["$gt"] =  from;
          }
          if (until) {
            where.recordingDateTime["$lt"] =  until;
          }
        }
      }

      const params = {
        where: where,
        tagMode: query.tagMode
      };
      if (query.limit) {
        params.limit = query.limit;
        if (query.offset) {
          params.offset = query.offset;
        }
      }

      if (!useForApiCall) {
        params.days = this.dates.days;
        params.fromDate = this.dates.fromDate;
        params.toDate = this.dates.toDate;
        
        if (this.selectedDevices.length > 0) {
          params.devices = this.selectedDevices;
        }
        if (this.selectedGroups.length > 0) {
          params.groups = this.selectedGroups;
        }
      }

      if (query.tags && query.tags.length > 0) {
        params.tags = query.tags;
      }
      for (const key in params) {
        const val = params[key];
        if (typeof val === "object") {
          params[key] = JSON.stringify(val);
        }
      }

      return params;
    },

    devicesDescription() {
        const numDevices = this.selectedDevices.length;
        const numGroups = this.selectedGroups.length;
        const total = numDevices + numGroups;

        const multipleSuffix = total > 1 ? "s" : "";

        if (total === 0) {
          return "All devices"
        } else if (numDevices && numGroups) {
          return `${total} groups and devices`;
        } else if (numGroups) {
          return `${total} group${multipleSuffix}`;
        }
        return `${total} device${multipleSuffix}`;
    },

    searchDescription() {
      // Get the current search query, not the live updated one.
      if (this.lastQuery !== null) {
        const query = this.lastQuery;
        const devices = this.devicesDescription();
        if (this.onlyRecordingType) {
          query.where.type = this.onlyRecordingType;
        } else if (!query.where.type) {
          query.where.type = this.$store.state.User.recordingTypePref;
        }
        const recordings =
          query.where.type === "both" ? "audio and video" : query.where.type;
        const numAnimals = query.tags.length;
        const multipleAnimalSuffix = numAnimals > 1 ? "s" : "";
        const tagsText =
          numAnimals === 0
            ? "all animals"
            : `${numAnimals} animal${multipleAnimalSuffix}`;
        const isCustom =
          query.where.dateRange && query.where.dateRange.isCustom;
        const isAll = query.where.dateRange && query.where.dateRange.all;
        const relativeDateRange = Math.abs(
          Number(3000)
        );
        let timespan;
        if (relativeDateRange === 1) {
          timespan = "last 24 hours";
        } else if (isAll || isNaN(relativeDateRange)) {
          timespan = "";
        } else {
          timespan = `last ${relativeDateRange} days`;
        }

        const duration = query.where.duration;
        const durationFrom =
          duration.hasOwnProperty("$gte") && Number(duration["$gte"]);
        const durationTo =
          duration.hasOwnProperty("$lte") && Number(duration["$lte"]);
        let durationStr = "";
        if (
          durationFrom !== false &&
          durationTo !== false &&
          durationTo !== 0
        ) {
          durationStr = ` with durations <strong>${durationFrom}</strong>&nbsp;&ndash;&nbsp;<strong>${durationTo}s</strong>`;
        } else if (durationFrom !== false && durationFrom !== 0) {
          durationStr = ` with durations <strong>> ${durationFrom}s</strong>`;
        }

        if (!isAll) {
          if (isCustom) {
            timespan = `between <strong>${moment(
              query.where.recordingDateTime["$gt"]
            ).format("L")}</strong>&nbsp;
              and&nbsp;<strong>${moment(query.where.recordingDateTime["$lt"])
                .add(1, "days")
                .format("L")}</strong>${durationStr}`;
          } else {
            timespan = `in the <strong>${timespan}</strong>`;
          }
        }
        return (
          `<strong>${devices}</strong>, <strong>${recordings} recordings</strong> and <strong>${tagsText}</strong> ` +
          `${timespan}${durationStr}`
        );
      } else {
        return "";
      }
    },
    updateDeviceSelection(eventData) {
      if (eventData.hasOwnProperty("devices")) {
        this.selectedDevices = eventData.devices;
      }
      if (eventData.hasOwnProperty("groups")) {
        this.selectedGroups = eventData.groups;
      }
    },
    updateDates(eventData) {
      this.dates = eventData;
    },
    updateDateDescription(description) {
      this.dateDescription = description;
    }
  }
};
</script>

<style scoped lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

$main-content-width: 640px;

.query-recordings {
  padding: 15px;
  overflow: auto;
  height: 100vh;
  @include media-breakpoint-up(lg) {
    max-height: calc(100vh - var(--navbar-height));
  }
  h2 {
    font-size: 1.2rem;
    color: $gray-700;
    margin: 1rem 0 0.8rem;
  }
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
.search-panel-toggle-btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  transition: transform 0.2s;
  @include media-breakpoint-down(lg) {
    position: fixed;
    top: 55px;
    left: 0;
    transform: translate(var(--search-panel-width));
    &.is-collapsed {
      transform: translate(var(--search-panel-width));
    }
  }
  @include media-breakpoint-up(lg) {
    display: none;
  }
}

.toggle-advanced-search-btn {
  margin-left: -0.75rem;
  margin-bottom: 1rem;
}
</style>
