<template>
    <b-form-row>
      <b-col cols="12">
        <h4>{{ heading }}</h4>
      </b-col>
      <b-col sm="6" md="4">
        <SelectDevice
        v-model="devices"/>
      </b-col>
      <b-col sm="6" md="4">
        <SelectTagTypes
        v-model="tagTypes"/>
      </b-col>
      <b-col sm="6" md="4">
        <SelectAnimal
        v-model="animals"/>
      </b-col>
      <b-col sm="6" md="4">
        <SelectDuration
        v-model="duration"/>
      </b-col>
      <b-col sm="6" md="4">
        <SelectDate title="From Date" v-model="fromDate"/>
      </b-col>
      <b-col sm="6" md="4">
        <SelectDate title="To Date" v-model="toDate"/>
      </b-col>
      <b-col cols="12">
        <b-button
        v-on:click="buildQuery"
        block
        variant="primary">Search</b-button>
      </b-col>
    </b-form-row>
</template>

<script>

import SelectDevice from './SelectDevice.vue'
import SelectTagTypes from './SelectTagTypes.vue'
import SelectAnimal from './SelectAnimal.vue'
import SelectDuration from './SelectDuration.vue'
import SelectDate from './SelectDate.vue'

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'query-recordings',
  components: {
    SelectDevice, SelectTagTypes, SelectAnimal, SelectDuration, SelectDate
  },
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data () {
    return {
      duration: {
        low: "0",
        high: null
      },
      devices: [],
      animals: [],
      fromDate: null,
      toDate: null,
      tagTypes: null
    }
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {
  },
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {
    heading: String,
    value: Object
  },
  methods: {
    buildQuery() {
      let query = {type: 'thermalRaw'}
      // Add devices
      if (this.devices.length !== 0) {
        query.DeviceId = []
        for (let device of this.devices) {
          query.DeviceId.push(device.id)
        }
      }
      // Add duration
      if (this.duration.low || this.duration.high) {
        query.duration = {}
      }
      if (this.duration.low) {
        query.duration["$gt"] = this.duration.low
      }
      if (this.duration.high) {
        query.duration["$lt"] = this.duration.high
      }
      // Add date
      if (this.fromDate || this.toDate ) {
        query.recordingDateTime = {};
      }
      if (this.fromDate) {
        query.recordingDateTime["$gt"] = this.fromDate;
      }
      if (this.toDate) {
        query.recordingDateTime["$lt"] = this.toDate;
      }
      this.$emit('input', query)
      this.$emit('searchButton')
    }
  }
}

</script>
