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
        @click="buildQuery">Search</b-button>
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
    value: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      duration: {
        low: "0",
        high: null
      },
      devices: [],
      animals: [],
      fromDate: "",
      toDate: "",
      tagTypes: 'any'
    };
  },
  computed: {
    isAudio: function () {
      // If it is an audio recording, then animals and tag types should be
      // disabled as these filters do not apply to audio recordings
      return this.recordingType !== "video";
    },
    recordingType: {
      get () {
        return this.$store.state.User.recordingTypePref;
      },
      set (value) {
        this.$store.commit('User/updateRecordingTypePref', value);
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
  mounted: function () {
    if (this.$route.query) {
      const query = this.$route.query;
      this.devices = [query.deviceId];
      this.recordingType = query.recordingType;
      this.fromDate = query.fromDate;
      this.toDate = query.toDate;
      this.buildQuery();
    }
  },
  methods: {
    buildQuery() {
      const query = {
        where: {}
      };
      // Add devices
      if (this.devices.length !== 0) {
        query.where.DeviceId = [];
        for (const device of this.devices) {
          if (typeof device.id === 'number') {
            // Add single devices
            query.where.DeviceId.push(device.id);
          } else {
            // Add groups of devices
            for (const item of device.devices) {
              query.where.DeviceId.push(item.id);
            }
          }
        }
      }
      // Add duration
      if (this.duration.low || this.duration.high) {
        query.where.duration = {};
      }
      if (this.duration.low) {
        query.where.duration["$gt"] = this.duration.low;
      }
      if (this.duration.high) {
        query.where.duration["$lt"] = this.duration.high;
      }
      // Add date
      if (this.fromDate || this.toDate ) {
        query.where.recordingDateTime = {};
      }
      if (this.fromDate) {
        query.where.recordingDateTime["$gt"] = this.fromDate;
      }
      if (this.toDate) {
        query.where.recordingDateTime["$lt"] = this.toDate;
      }
      // Add tag mode
      if (this.tagTypes !== 'any') {
        query.tagMode = this.tagTypes.text;
      }
      // Add animal tags
      if (this.animals.length !== 0) {
        query.tags = [];
        for (const animal of this.animals) {
          query.tags.push(animal);
        }
      }
      // Add recording type
      if (this.recordingType == 'video') {
        query.where.type = 'thermalRaw';
      } else if (this.recordingType == 'audio') {
        query.where.type = 'audio';
      }
      this.$emit('input', query);
      this.$emit('searchButton');
    }
  }
};

</script>
