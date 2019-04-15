<template>
  <b-form-row>
    <b-col
      sm="6"
      md="4">
      <SelectDevice
        v-model="devices"/>
    </b-col>
    <b-col
      sm="6"
      md="2" >
      <SelectRecordingType
        v-model="recordingType"/>
    </b-col>
    <b-col
      sm="6"
      md="2">
      <SelectTagTypes
        v-model="tagTypes"
        :disabled="isAudio"/>
    </b-col>
    <b-col
      sm="6"
      md="4">
      <SelectAnimal
        v-model="animals"
        :disabled="isAudio"
        :can-have-sub-tags="canHaveTags"/>
    </b-col>
    <b-col
      sm="6"
      md="4">
      <SelectDuration
        v-model="duration"/>
    </b-col>
    <b-col
      sm="6"
      md="4">
      <SelectDate
        v-model="fromDate"
        title="From Date"/>
    </b-col>
    <b-col
      sm="6"
      md="4">
      <SelectDate
        v-model="toDate"
        title="To Date"/>
    </b-col>
    <b-col cols="12">
      <b-button
        :disabled="disabled"
        block
        variant="primary"
        @click="() => $emit('submit')"
      >
        <span v-if="!disabled">Search</span>
        <span v-else>Searching...</span>
      </b-button>
    </b-col>
  </b-form-row>
</template>

<script>

import SelectDevice from './SelectDevice.vue';
import SelectTagTypes from './SelectTagTypes.vue';
import SelectAnimal from './SelectAnimal.vue';
import SelectDuration from './SelectDuration.vue';
import SelectDate from './SelectDate.vue';
import SelectRecordingType from './SelectRecordingType.vue';

export default {
  name: 'QueryRecordings',
  components: {
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
      isAudio: true,
      hasSpecifiedTags: false,
      canHaveTags: false,
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
        this.query.where.recordingDateTime["$lt"] = `${value} 23:59:59`;
      }
    },
    animals: {
      get () {
        return this.query.tags;
      },
      set (value) {
        this.query.tags = value;
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
    }
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
    canHaveSpecifiedTags: function(tagType) {
      switch (tagType) {
      case 'tagged':
      case 'human-tagged':
      case 'automatic-tagged':
      case 'both-tagged':
        return true;
      default:
        return false;
      }
    }
  },
};

</script>
