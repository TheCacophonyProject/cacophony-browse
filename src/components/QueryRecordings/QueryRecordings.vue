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
        :disabled="isAudio"/>
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
        block
        variant="primary"
        @click="() => $emit('submit')">Search</b-button>
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
    query: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      deviceGroups: [],
    };
  },
  computed: {
    isAudio: function () {
      // If it is an audio recording, then animals and tag types should be
      // disabled as these filters do not apply to audio recordings
      return this.recordingType !== "thermalRaw";
    },
    recordingType: {
      // TODO This should probably also be stored in the url, since it needs to be shared.
      get () {
        const recordingPref = this.$store.state.User.recordingTypePref;
        if (recordingPref === 'video') {
          return 'thermalRaw';
        }
        return recordingPref || 'both';
      },
      set (value) {
        // Store video/audio/both
        if (value === 'thermalRaw') {
          value = 'video';
        }
        this.$store.commit('User/updateRecordingTypePref', value);
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
        return this.query.where.recordingDateTime["$lt"].replace(' 23:59:59', '') || '';
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
    }
  },
  methods: {
    parseDate (date) {
      const day = (0 + date.getDate().toString()).slice(-2);
      const month = (0 + (date.getMonth() + 1).toString()).slice(-2);
      const year = date.getFullYear();
      return year + "-" + month + "-" + day;
    },
  }
};

</script>
