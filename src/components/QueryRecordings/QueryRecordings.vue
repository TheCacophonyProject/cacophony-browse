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
    // loadFromUrlQuery: function () {
    //   const query = this.$route.query;
    //   if (query && Object.keys(query).length > 0) {
    //     this.tagTypes = query.tagMode || 'any';
    //     this.animals = (query.tags && JSON.parse(query.tags)) || [];
    //     if (query.where) {
    //       const whereClause = JSON.parse(query.where);
    //       let type = 'both';
    //       if (whereClause.type) {
    //         type = whereClause.type === 'thermalRaw' ? 'video' : whereClause.type;
    //       }
    //       this.recordingType = type;
    //       this.duration = (whereClause.duration && {
    //         low: whereClause.duration["$gte"] || "0",
    //         high: whereClause.duration["$lte"] || null,
    //       }) || this.duration;
    //       this.fromDate = (
    //         whereClause.recordingDateTime &&
    //         whereClause.recordingDateTime["$gt"]
    //       ) || '';
    //       this.toDate = (
    //         whereClause.recordingDateTime &&
    //         whereClause.recordingDateTime["$lt"] &&
    //         whereClause.recordingDateTime["$lt"].replace(" 23:59:59", '')
    //       ) || '';
    //       this.deviceGroups = whereClause.DeviceGroups || [];
    //       this.devices = [...this.devices, ...this.deviceGroups];
    //       if (whereClause.DeviceId) {
    //         this.devices = [...this.devices, ...whereClause.DeviceId];
    //       }
    //     }
    //     this.buildQuery();
    //   }
    //},
    buildQuery() {

      // const query = {
      //   where: {}
      // };
      // // Add devices
      // if (this.devices.length !== 0) {
      //   const deviceIds = [];
      //   for (const device of this.devices) {
      //     if (typeof device === 'object') {
      //       if (typeof device.id === 'number') {
      //         // Add single devices
      //         deviceIds.push(device.id);
      //       } else {
      //         // NOTE: if the device is a group, the id is a string.
      //         // Add groups of devices
      //         query.where.DeviceGroups = query.where.DeviceGroups || [];
      //         query.where.DeviceGroups.push(device.id);
      //         if (device.devices) {
      //           for (const item of device.devices) {
      //             deviceIds.push(item.id);
      //           }
      //         }
      //       }
      //     } else if (typeof device === 'number') {
      //       // We're reconstituting this from the query params, so we only have
      //       // device ids at this stage, we don't have the labels.
      //       deviceIds.push(device);
      //     }
      //   }
      //   // Dedupe ids.
      //   query.where.DeviceId = deviceIds.reduce((acc, id) => {
      //     !acc.includes(id) && acc.push(id);
      //     return acc;
      //   }, []);
      // }
      // Any changes just alter the route, which is watched by the parent component,
      // and will instigate any api calls required.

      this.$emit('input', this.query);
    }
  }
};

</script>
