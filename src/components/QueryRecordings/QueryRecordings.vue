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
      md="4">
      <SelectTagTypes
        v-model="tagTypes"/>
    </b-col>
    <b-col
      sm="6"
      md="4">
      <SelectAnimal
        v-model="animals"/>
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

export default {
  name: 'QueryRecordings',
  components: {
    SelectDevice, SelectTagTypes, SelectAnimal, SelectDuration, SelectDate
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
      tagTypes: { text: null, label: 'any' }
    };
  },
  methods: {
    buildQuery() {
      const query = {
        type: 'thermalRaw',
        where: {}
      };
      // Add devices
      if (this.devices.length !== 0) {
        query.where.DeviceId = [];
        for (const device of this.devices) {
          query.where.DeviceId.push(device.id);
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
      if (this.tagTypes.label !== 'any') {
        query.tagMode = this.tagTypes.text;
      }
      // Add animal tags
      if (this.animals.length !== 0) {
        query.tags = [];
        for (const animal of this.animals) {
          query.tags.push(animal);
        }
      }
      this.$emit('input', query);
      this.$emit('searchButton');
    }
  }
};

</script>
