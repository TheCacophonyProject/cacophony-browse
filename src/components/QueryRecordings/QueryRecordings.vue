<template>
  <div class="query-recordings">
    <b-form-group>
      <b-form-col>
        <h2>Search recordings</h2>
        <SelectDevice v-model="devices" />
        <SelectRecordingType v-model="recordingType" />
        <SelectAnimal
          v-model="animals"
          :disabled="isAudio"
          :can-have-sub-tags="canHaveTags"/>
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
        <SelectDuration
          v-model="duration"/>
        <b-form-row>
          <b-col>
            <a
              href="#"
              @click.prevent="() => toggleAdvancedSearch()"
            >Advanced search</a>
          </b-col>
        </b-form-row>
        <SelectTagTypes
          v-if="advanced"
          v-model="tagTypes"
          :disabled="isAudio"
        />
        <b-button
          :disabled="disabled"
          block
          variant="primary"
          @click="() => $emit('submit')"
        >
          <span v-if="!disabled">Search</span>
          <span v-else>Searching...</span>
        </b-button>
      </b-form-col>
    </b-form-group>
  </div>
</template>

<script>
import DefaultLabels from '../../const.js';
import SelectDevice from './SelectDevice.vue';
import SelectTagTypes from './SelectTagTypes.vue';
import SelectAnimal from './SelectAnimal.vue';
import SelectDuration from './SelectDuration.vue';
import SelectDate from './SelectDate.vue';
import SelectRecordingType from './SelectRecordingType.vue';
import SelectDateRange from "./SelectDateRange.vue";

export default {
  name: 'QueryRecordings',
  components: {
    SelectDateRange,
    SelectDevice, SelectTagTypes, SelectAnimal, SelectDuration, SelectDate, SelectRecordingType
  },
  props: {
    disabled: {
      type: Boolean,
      required: true
    },
    query: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      rawAnimals:[],
      hasSpecifiedTags: false,
      canHaveTags: false,
      isAudio: true,
      advanced: false,
      isCustomDateRange: false,
    };
  },
  computed: {
    recordingType: {
      get () {
        return this.query.where.type || 'both';
      },
      set (value) {
        this.query.where.type = value;
        // If it is an audio recording, then animals and tag types should be
        // disabled as these filters do not apply to audio recordings
        this.isAudio = value !== 'video';
      }
    },
    duration: {
      get () {
        const duration = this.query.where.duration;
        return {low: duration["$gte"], high: duration["$lte"]};
      },
      set (value) {
        this.query.where.duration["$gte"] = value.low;
        this.query.where.duration["$lte"] = value.high;
      }
    },
    tagTypes: {
      get () {
        return this.query.tagMode;
      },
      set (value) {
        this.query.tagMode = value;
        this.canHaveTags = this.canHaveSpecifiedTags(value);
        if (!this.canHaveTags) {
          this.animals = [];
        }
      }
    },
    dateRange: {
      get () {
        return this.query.where.dateRange || {};
      },
      set (value) {
        this.query.where.dateRange = value;
        this.isCustomDateRange = (this.query.where.dateRange && this.query.where.dateRange.isCustom) || false;
      }
    },
    fromDate: {
      get () {
        return this.query.where.recordingDateTime["$gt"] || "";
      },
      set (value) {
        this.query.where.recordingDateTime["$gt"] = value;
      }
    },
    toDate: {
      get () {
        return (
          this.query.where.recordingDateTime["$lt"] &&
          this.query.where.recordingDateTime["$lt"].replace(' 23:59:59', '')
        ) || '';
      },
      set (value) {
        if (value && value.trim() !== "") {
          this.query.where.recordingDateTime["$lt"] = `${value} 23:59:59`;
        } else {
          this.query.where.recordingDateTime["$lt"] = "";
        }
      }
    },
    animals: {
      get () {
        return this.rawAnimals;
      },
      set (value) {
        this.rawAnimals = value;
        this.query.tags = value.map(option => option.value ? option.value : option.text );
        this.hasSpecifiedTags = this.query.tags.length > 0;
        if (this.hasSpecifiedTags) {
          if (!this.canHaveTags) {
            this.tagTypes = 'tagged';
          }
        }
      }
    },
    devices: {
      get () {
        return this.query.where.DeviceId;
      },
      set (value) {
        this.query.where.DeviceId = value;
      }
    },
    groups: function() {
      return this.$store.state.Groups;
    },
  },
  watch: {
    isAudio: function () {
      if (this.isAudio) {
        // Reset any existing filters for animals and tag types when searching
        // for audio recordings
        this.animals = [];
        this.tagTypes = 'any';
      }
    },
  },
  methods: {
    canHaveSpecifiedTags: DefaultLabels.canHaveSpecifiedTags,
    toggleAdvancedSearch: function () {
      this.advanced = !this.advanced;
    },
  },
};

</script>
<style scoped>
  .query-recordings {
    /*padding: 15px;*/
  }
  h2 {
    color: #666;
    font-size: 18px;
  }
</style>
