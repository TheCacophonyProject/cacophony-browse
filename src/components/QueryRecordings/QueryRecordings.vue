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
      <SelectDateRange v-model="dates" />
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
      <SelectTags 
        v-if="advanced" 
        v-model="tagData" 
        :isDisabled="isAudio"         
      />
      <b-button
        :disabled="disabled"
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
import SelectTags from "./SelectTags.vue";
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
    SelectTags,
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
      lastQueryDescription: "",
      query: {},
      rawAnimals: [],
      advanced: false,
      selectedDevices: [],
      selectedGroups: [],
      dates: {},
      dateDescription: "", 
      duration: {}  , 
      recordingType: "",
      tagData: {}
    };
  },
  computed: {
    isAudio : function () {
      return this.recordingType === "audio";
    },
    groups: function() {
      return this.$store.state.Groups;
    },
  },
  mounted() {
    this.resetToDefaultQuery();

    if (Object.keys(this.$route.query).length === 0) {
      // Populate the url params if we got here without them, ie. /recordings
      this.updateRouteQuery();
    } else {
      this.deserialiseRouteIntoQuery(this.$route.query);
    }

    this.makeApiRequest();
  },
  methods: {
    saveLastQuery() {
      this.lastQuery = this.serialiseQueryForRecall();
      this.lastQueryDescription = this.makeSearchDescription();
    },
    queryHasChanged() {
      return JSON.stringify(this.lastQuery) !== JSON.stringify(this.serialiseQueryForRecall());
    },
    updatePagination(perPage, page) {
      this.query.limit = perPage;
      const newOffset = Math.max(0, (page - 1) * perPage);
      this.query.offset = newOffset;
      this.updateRouteQuery();
    },
    setOnlyIfExists(itemName, source, destination) {
      if (source.hasOwnProperty(itemName)) {
        destination[itemName] = source[itemName];
      }
    },
    makeArray(value) {
      if (typeof value === "object") {
        return value;
      }
      else {
        return (value) ? [ value ] : [];
      }
    },
    setAdvancedInitalState() {
      // If there was an advanced query, start with the advanced toggle area open.
      this.advanced =
        this.tagData.hasData ||
        this.duration.hasOwnProperty("high") ||
        this.duration.hasOwnProperty("low");
    },
    deserialiseRouteIntoQuery(routeQuery) {
      const target = this.query;


      this.setOnlyIfExists("offset", routeQuery, target);
      this.setOnlyIfExists("limit", routeQuery, target);

      this.setOnlyIfExists("tagMode", routeQuery, this.tagData);
      if (routeQuery.hasOwnProperty("tag")) {
        target.tags = this.makeArray(routeQuery.tag);
      }


      if (routeQuery.hasOwnProperty("minS")) { 
        this.duration.low = routeQuery.minS;
      }
      if (routeQuery.hasOwnProperty("maxS")) { 
        this.duration.high = routeQuery.maxS;
      }      

      if (routeQuery.hasOwnProperty("tag")) {
        target.tagData.tags = this.makeArray(routeQuery.tag);
      }

      if (routeQuery.hasOwnProperty("type")) {
        this.recordingType = routeQuery.type;
      }

      this.dates = {
        days: routeQuery.days,
        to: routeQuery.to,
        from: routeQuery.from
      }

      if (routeQuery.hasOwnProperty("group")) {
        this.selectedGroups = this.makeArray(routeQuery.group);
      }
      if (routeQuery.hasOwnProperty("device")) {
        this.selectedDevices = this.makeArray(routeQuery.device);
      }

      this.setAdvancedInitalState();
    },
    serialiseQueryForRecall() {
      const params = {
        tagMode: this.tagData.tagMode,
        minS: this.duration.low,
        maxS: this.duration.high,
        tag: this.tagData.tags,
        limit: this.query.limit,
        offset: this.query.offset,
        days: this.dates.days,
        from: this.dates.from ,
        to: this.dates.to,
        group: this.selectedGroups,
        device: this.selectedDevices,
        type: this.recordingType,
      };

      return params;
    },

    updateRouteQuery() {
      // Update the url query params string so that this search can be easily shared.
      if (this.queryHasChanged()) {  
        this.$router.push({
          path: this.path,
          query: this.serialiseQueryForRecall()
        });
      }
    },

    submit: function() {
      if (!this.onlyRecordingType) {
        this.$store.commit("User/updateRecordingTypePref", this.recordingType);
      }

      // Every time we submit a new query, we need to clear the offset param, as if we are on page 2+ of the results,
      // we can end up with an offset that is greater than the number of results in the new query.
      Vue.delete(this.query, "offset");      
      this.updateRouteQuery();
      this.makeApiRequest();
    },

    makeApiRequest: function() {
      this.saveLastQuery();
      this.toggleSearchPanel();
      this.$emit("submit", this.serialiseQueryForApi());
    },
    toggleAdvancedSearch: function() {
      this.advanced = !this.advanced;
    },
    toggleSearchPanel: function() {
      this.$emit("toggled-search-panel");
    },
    resetToDefaultQuery() {
      this.selectedDevices = [];
      this.selectedGroups = [];
      this.dates = {
        days: 30
      };
      this.duration = {};
      this.recordingType = this.$store.state.User.recordingTypePref || "both";
      this.tagData = {
        hasData: false
      }
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
    serialiseQueryForApi() {
      const where = {};
      this.addIfSet(where, this.duration.low, "duration", "$gte");
      this.addIfSet(where, this.duration.high, "duration", "$lte");

      // Map between the mismatch in video type types between frontend and backend
      if (this.recordingType === "video") {
        where.type = "thermalRaw";
      } else if (this.recordingType !== "both") {
        where.type = this.recordingType;
      }

      // Remove the group param, since the API doesn't handle that, we're just using
      // it to accurately share search parameters via urls.
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
      if (this.dates.hasOwnProperty("days") && this.dates.days !== "all") {
        // For the previous x days we want to do it at the time the submit is pressed and not cache it.  
        // they could have had the window open for a few days.  
        const now = new Date();
        from = this.formatQueryDate(moment(now).add(-1 * this.dates.days, "days"));
      } 
      this.addIfSet(where, from, "recordingDateTime", "$gt");
      this.addIfSet(where, until, "recordingDateTime", "$lt");

      const params = {
        where: where,
      };

      if (this.tagData.hasData){
        params.tagMode = this.tagData.tagMode;
        if (this.tagData.tags.length > 0) {
          params.tags = this.tagData.tags;
        }
      }
 
      if (this.query.limit) {
        params.limit = this.query.limit;
        if (this.query.offset) {
          params.offset = this.query.offset;
        }
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
      return this.lastQueryDescription;
    },
    makeSearchDescription() {
      // Get the current search query, not the live updated one.
      const devices = this.devicesDescription();

      const recordings =
          this.recordingType === "both" ? "audio and video" : this.recordingType;
      const numAnimals = (this.tagData.tags) ? this.tagData.tags.length : 0;
      const multipleAnimalSuffix = numAnimals > 1 ? "s" : "";
      const tagsText =
        numAnimals === 0
          ? "all animals"
          : `${numAnimals} animal${multipleAnimalSuffix}`;
      const isCustom = false;
      const isAll = this.dates.days === "all";
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

      const durationFrom =
        this.duration.hasOwnProperty("low") && Number(this.duration["low"]);
      const durationTo =
        this.duration.hasOwnProperty("high") && Number(this.durationy["high"]);
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
            this.fromDate
          ).format("L")}</strong>&nbsp;
            and&nbsp;<strong>${moment(query.toDate["$lt"])
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
    },

    updateDeviceSelection(eventData) {
      if (eventData.hasOwnProperty("devices")) {
        this.selectedDevices = eventData.devices;
      }
      if (eventData.hasOwnProperty("groups")) {
        this.selectedGroups = eventData.groups;
      }
    },
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
