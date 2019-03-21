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
      deviceGroups: [],
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
    const query = this.$route.query;
    if (query && Object.keys(query).length > 0) {

      this.tagTypes = query.tagMode || 'any';
      this.animals = (query.tags && JSON.parse(query.tags)) || [];
      if (query.where) {
        const whereClause = JSON.parse(query.where);
        let type = 'both';
        if (whereClause.type) {
          type = whereClause.type === 'thermalRaw' ? 'video' : whereClause.type;
        }
        this.recordingType = type;
        this.duration = (whereClause.duration && {
          low: whereClause.duration["$gte"] || "0",
          high: whereClause.duration["$lte"] || null,
        }) || this.duration;
        this.fromDate = (
          whereClause.recordingDateTime &&
          whereClause.recordingDateTime["$gt"]
        ) || '';
        this.toDate = (
          whereClause.recordingDateTime &&
          whereClause.recordingDateTime["$lt"] &&
          whereClause.recordingDateTime["$lt"].replace(" 23:59:59", '')
        ) || '';
        this.deviceGroups = whereClause.DeviceGroups || [];
        this.devices = [...this.devices, ...this.deviceGroups];
        if (whereClause.DeviceId) {
          this.devices = [...this.devices, ...whereClause.DeviceId];
        }
      } else {
        // Old behaviour, may be redundant now.
        // Not even sure when this case can be hit?
        this.devices = (query.deviceId ? [JSON.parse(query.deviceId)] : []);
        this.recordingType = (query.recordingType ? JSON.parse(query.recordingType) : 'both');
        this.fromDate = (query.fromDate ? this.parseDate(new Date(query.fromDate)) : '');
        this.toDate = (query.toDate ? this.parseDate(new Date(query.toDate)) : '');
      }
      this.buildQuery();
    }
  },
  methods: {
    parseDate (date) {
      const day = (0 + date.getDate().toString()).slice(-2);
      const month = (0 + (date.getMonth() + 1).toString()).slice(-2);
      const year = date.getFullYear();
      return year + "-" + month + "-" + day;
    },
    buildQuery() {
      const query = {
        where: {}
      };
      // Add devices
      if (this.devices.length !== 0) {
        const deviceIds = [];
        for (const device of this.devices) {
          if (typeof device === 'object') {
            if (typeof device.id === 'number') {
              // Add single devices
              deviceIds.push(device.id);
            } else {
              // NOTE: if the device is a group, the id is a string.
              // Add groups of devices
              query.where.DeviceGroups = query.where.DeviceGroups || [];
              query.where.DeviceGroups.push(device.id);
              if (device.devices) {
                for (const item of device.devices) {
                  deviceIds.push(item.id);
                }
              }
            }
          } else if (typeof device === 'number') {
            // We're reconstituting this from the query params, so we only have
            // device ids at this stage, we don't have the labels.
            deviceIds.push(device);
          }
        }
        // Dedupe ids.
        query.where.DeviceId = deviceIds.reduce((acc, id) => {
          !acc.includes(id) && acc.push(id);
          return acc;
        }, []);
      }
      if (this.deviceGroups && this.deviceGroups.length) {
        query.where.DeviceGroups = this.deviceGroups;
      }
      // Add duration
      if (this.duration.low || this.duration.high) {
        query.where.duration = {};
      }
      if (this.duration.low) {
        query.where.duration["$gte"] = this.duration.low;
      }
      if (this.duration.high) {
        query.where.duration["$lte"] = this.duration.high;
      }
      // Add date
      if (this.fromDate || this.toDate ) {
        query.where.recordingDateTime = {};
      }
      if (this.fromDate) {
        query.where.recordingDateTime["$gt"] = this.fromDate;
      } else {
        query.where.recordingDateTime && delete query.where.recordingDateTime["$gt"];
      }
      if (this.toDate) {
        query.where.recordingDateTime["$lt"] = this.toDate + " 23:59:59";
      } else {
        query.where.recordingDateTime && delete query.where.recordingDateTime["$lt"];
      }
      // Add tag mode
      if (this.tagTypes !== 'any') {
        query.tagMode = this.tagTypes;
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
