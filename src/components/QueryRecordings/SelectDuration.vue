<template>
  <b-form-group>
    <label>Duration (sec)</label>
    <b-form-row>
      <b-form-input
      type="number"
      min="0"
      v-bind:max="value.high"
      class="form-control col-4"
      v-bind:value="value.low"
      v-on:change="updateLow"/>
      <label class="col-4 text-center col-form-label">to</label>
      <b-form-input
      type="number"
      v-bind:min="value.low"
      class="form-control col-4"
      v-bind:value="value.high"
      v-on:change="updateHigh"/>
    </b-form-row>
  </b-form-group>
</template>

<script>

export default {
	// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
	name: 'duration-slider',
  components: {
  },
	// https://vuejs.org/v2/style-guide/#Component-data-essential
	data () {
		return {
		}
	},
	// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
	computed: {
	},
	// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
	props: {value: Object},
  methods: {
    updateHigh: function () {
      let newValue = {
        high: event.target.value,
        low: this.value.low
      }
      this.$emit('input', newValue)
    },
    updateLow: function () {
      let newValue = {
        high: this.value.high,
        low: event.target.value
      }
      this.$emit('input', newValue)
    }
  }
}

</script>
