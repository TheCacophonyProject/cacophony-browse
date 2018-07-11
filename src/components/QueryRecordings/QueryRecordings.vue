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
        <b-button block variant="primary">Search</b-button>
      </b-col>
      <h4>Selected options</h4>
      <ul>
        <li>
          Duration low: {{ duration.low }}
        </li>
        <li>
          Duration high: {{ duration.high }}
        </li>
        <li>
          Devices: {{ devices }}
        </li>
        <li>
          Animals: {{ animals }}
        </li>
        <li>
          From Date: {{ fromDate }}
        </li>
        <li>
          To Date: {{ toDate }}
        </li>
        <li>
          Tag Types: {{ tagTypes }}
        </li>
        <li>
          Duration Value: {{ duration }}
        </li>
      </ul>

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
      tagTypes: null,
      enlargeText: 1
		}
	},
	// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
	computed: {
    durationLow: function () {
      // return "low"
      return this.durationValue //.split(",")[0]
    },
    durationHigh: function () {
      return this.durationValue //.split(",")[1]
    },
	},
	// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
	props: {
    heading: String
  },
  methods: {
    updateTagType(tagType) {
      this.tagtype = tagType
      console.log('update tag type') //eslint-disable-line
    }
  }
}

</script>
