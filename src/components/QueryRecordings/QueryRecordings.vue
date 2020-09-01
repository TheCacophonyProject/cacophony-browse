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
      <SelectTags v-if="advanced" v-model="tagData" :isDisabled="isAudio" />
      <b-button :disabled="disabled" block variant="primary" @click="submit">
        <span v-if="!disabled">Search</span>
        <span v-else>Searching...</span>
      </b-button>
    </b-form-group>
  </div>
</template>

<script>
import SelectDevice from "./SelectDevice.vue";
import SelectTags from "./SelectTags.vue";
import SelectDuration from "./SelectDuration.vue";
import SelectRecordingType from "./SelectRecordingType.vue";
import SelectDateRange from "./SelectDateRange.vue";
import Vue from "vue";

export default {
  name: "QueryRecordings",
  components: {
    SelectDateRange,
    SelectDevice,
    SelectTags,
    SelectDuration,
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
      query: {},
      rawAnimals: [],
      advanced: false,
      selectedDevices: [],
      selectedGroups: [],
      dates: {},
      dateDescription: "",
      duration: {},
      recordingType: "",
      tagData: {}
    };
  },
  computed: {
    isAudio: function() {
      return this.recordingType === "audio";
    },
    groups: function() {
      return this.$store.state.Groups;
    }
  },
  created() {
    this.resetToDefaultQuery();

    if (Object.keys(this.$route.query).length === 0) {
      // Populate the url params if we got here without them, ie. /recordings
      this.updateRouteQuery();
    } else {
      this.deserialiseRouteIntoQuery(this.$route.query);
    }
  },
  mounted() {
    this.makeApiRequest();
  },
  methods: {
    resetToDefaultQuery() {
      this.selectedDevices = [];
      this.selectedGroups = [];
      this.dates = {
        days: 30
      };
      this.duration = {};
      this.recordingType = this.$store.state.User.recordingTypePref || "both";
      this.tagData = {
        tagMode: "any"
      };
    },
    saveLastQuery() {
      this.lastQuery = this.serialiseQueryForRecall();
      this.$emit("description", this.makeSearchDescription());
    },
    queryHasChanged() {
      return (
        JSON.stringify(this.lastQuery) !==
        JSON.stringify(this.serialiseQueryForRecall())
      );
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
      } else {
        return value ? [value] : [];
      }
    },
    setAdvancedInitalState() {
      // If there was an advanced query, start with the advanced toggle area open.
      this.advanced =
        this.hasTagData() ||
        this.duration.hasOwnProperty("maxS") ||
        this.duration.hasOwnProperty("minS");
    },
    hasTagData() {
      return (
        this.tagMode !== "any" ||
        (this.tagData.tags && this.tagData.tags.length > 1)
      );
    },
    deserialiseRouteIntoQuery(routeQuery) {
      this.setOnlyIfExists("offset", routeQuery, this.query);
      this.setOnlyIfExists("limit", routeQuery, this.query);

      this.setOnlyIfExists("tagMode", routeQuery, this.tagData);

      this.setOnlyIfExists("minS", routeQuery, this.duration);
      this.setOnlyIfExists("maxS", routeQuery, this.duration);

      if (routeQuery.hasOwnProperty("tag")) {
        this.tagData.tags = this.makeArray(routeQuery.tag);
      }

      if (routeQuery.hasOwnProperty("type")) {
        this.recordingType = routeQuery.type;
      }

      this.dates = {
        days: routeQuery.days,
        to: routeQuery.to,
        from: routeQuery.from
      };

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
        minS: this.duration.minS,
        maxS: this.duration.maxS,
        tag: this.tagData.tags,
        limit: this.query.limit,
        offset: this.query.offset,
        days: this.dates.days,
        from: this.dates.from,
        to: this.dates.to,
        type: this.recordingType
      };

      if (this.selectedDevices.length > 0) {
        params.device = this.selectedDevices;
      }

      if (this.selectedGroups.length > 0) {
        params.group = this.selectedGroups;
      }

      // remove undefined elements
      for (const key in params) {
        if (!params[key] || params[key] === []) {
          delete params[key];
        }
      }

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
      this.$emit("submit", this.serialiseQueryForRecall());
    },
    toggleAdvancedSearch: function() {
      this.advanced = !this.advanced;
    },
    toggleSearchPanel: function() {
      this.$emit("toggled-search-panel");
    },
    devicesDescription() {
      const numDevices = this.selectedDevices.length;
      const numGroups = this.selectedGroups.length;
      const total = numDevices + numGroups;

      const multipleSuffix = total > 1 ? "s" : "";

      if (total === 0) {
        return "All devices";
      } else if (numDevices && numGroups) {
        return `${total} groups and devices`;
      } else if (numGroups) {
        return `${total} group${multipleSuffix}`;
      }
      return `${total} device${multipleSuffix}`;
    },
    makeSearchDescription() {
      // Get the current search query, not the live updated one.
      const devices = this.devicesDescription();
      const tagsText = this.tagData.description || "";
      const timespan = this.dates.description || "";
      const durationStr = this.duration.description || "";

      const recordings =
        this.recordingType === "both" ? "audio and video" : this.recordingType;

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
