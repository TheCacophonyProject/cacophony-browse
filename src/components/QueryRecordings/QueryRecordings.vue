<template>
  <div class="query-recordings">
    <b-button
      :class="['search-panel-toggle-btn', {'is-collapsed': isCollapsed}]"
      variant="primary"
      @click="() => toggleSearchPanel()"
    >
      <span v-if="isCollapsed">
        <font-awesome-icon
          :icon="['fas', 'search']"
        />
        <span class="sr-only">Expand search panel</span>
      </span>
      <span v-else>
        <font-awesome-icon
          :icon="['fas', 'times']"
        />
        <span class="sr-only">Collapse search panel</span>
      </span>
    </b-button>
    <b-form-group>
      <h2>Search recordings</h2>
      <SelectDevice v-model="devices" />
      <SelectRecordingType v-model="recordingType" />
      <SelectDateRange v-model="dateRange" />
      <b-form-row v-if="isCustomDateRange">
        <b-col
          sm="6"
        >
          <SelectDate
            v-model="fromDate"
            title="From Date"/>
        </b-col>
        <b-col
          sm="6"
        >
          <SelectDate
            v-model="toDate"
            title="To Date"/>
        </b-col>
      </b-form-row>
      <b-form-row>
        <b-col>
          <b-button
            variant="link"
            class="toggle-advanced-search-btn"
            @click="() => toggleAdvancedSearch()"
          >
            Advanced search
            <font-awesome-icon
              v-if="!advanced"
              :icon="['fas', 'caret-down']"
            />
            <font-awesome-icon
              v-else
              :icon="['fas', 'caret-up']"
            />
          </b-button>
        </b-col>
      </b-form-row>
      <SelectDuration
        v-if="advanced"
        v-model="duration"
      />
      <SelectTagTypes
        v-if="advanced"
        v-model="tagTypes"
        :disabled="isAudio"
      />
      <SelectAnimal
        v-if="advanced"
        v-model="animals"
        :disabled="isAudio"
        :can-have-sub-tags="canHaveTags"/>
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
import DefaultLabels from "../../const.js";
import SelectDevice from "./SelectDevice.vue";
import SelectTagTypes from "./SelectTagTypes.vue";
import SelectAnimal from "./SelectAnimal.vue";
import SelectDuration from "./SelectDuration.vue";
import SelectDate from "./SelectDate.vue";
import SelectRecordingType from "./SelectRecordingType.vue";
import SelectDateRange from "./SelectDateRange.vue";

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
    query: {
      type: Object,
      required: true
    },
    isCollapsed: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      rawAnimals: [],
      hasSpecifiedTags: false,
      canHaveTags: false,
      isAudio: true,
      advanced: false,
      loadedQuery: false,
      isCustomDateRange: false
    };
  },
  computed: {
    recordingType: {
      get() {
        return (
          this.query.where.type ||
          this.$store.state.User.recordingTypePref ||
          "both"
        );
      },
      set(value) {
        this.query.where.type = value;
        this.$store.commit("User/updateRecordingTypePref", value);
        // If it is an audio recording, then animals and tag types should be
        // disabled as these filters do not apply to audio recordings
        this.isAudio = value !== "video";
      }
    },
    duration: {
      get() {
        const duration = this.query.where.duration;
        return { low: duration["$gte"], high: duration["$lte"] };
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
    dateRange: {
      get() {
        return this.query.where.dateRange || {};
      },
      set(value) {
        this.query.where.dateRange = value;
        this.isCustomDateRange =
          (this.query.where.dateRange && this.query.where.dateRange.isCustom) ||
          false;
      }
    },
    fromDate: {
      get() {
        return this.query.where.recordingDateTime["$gt"] || "";
      },
      set(value) {
        this.query.where.recordingDateTime["$gt"] = value;
      }
    },
    toDate: {
      get() {
        return (
          (this.query.where.recordingDateTime["$lt"] &&
            this.query.where.recordingDateTime["$lt"].replace(
              " 23:59:59",
              ""
            )) ||
          ""
        );
      },
      set(value) {
        if (value && value.trim() !== "") {
          this.query.where.recordingDateTime["$lt"] = `${value} 23:59:59`;
        } else {
          this.query.where.recordingDateTime["$lt"] = "";
        }
      }
    },
    animals: {
      get() {
        return this.rawAnimals;
      },
      set(value) {
        this.rawAnimals = value;
        this.query.tags = value.map(
          option => (option.value ? option.value : option.text)
        );
        this.hasSpecifiedTags = this.query.tags.length > 0;
        if (this.hasSpecifiedTags) {
          if (!this.canHaveTags) {
            this.tagTypes = "tagged";
          }
        }
      }
    },
    devices: {
      get() {
        return this.query.where.DeviceId;
      },
      set(value) {
        this.query.where.DeviceId = value;
      }
    },
    groups: function() {
      return this.$store.state.Groups;
    },
    isCustomDateRangeAndRangeIsValid: function() {
      return (
        !this.isCustomDateRange ||
        (this.isCustomDateRange &&
          (this.query.where.recordingDateTime["$gt"] !== "" &&
            this.query.where.recordingDateTime["$lt"] !== ""))
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
    }
  },
  mounted() {
    this.isAudio = this.recordingType === "audio";
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
    submit: function() {
      this.$emit("submit");
      this.toggleSearchPanel();
    },
    canHaveSpecifiedTags: DefaultLabels.canHaveSpecifiedTags,
    toggleAdvancedSearch: function() {
      this.advanced = !this.advanced;
    },
    toggleSearchPanel: function() {
      this.$emit("toggled-search-panel");
    }
  }
};
</script>

<style scoped lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";
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
