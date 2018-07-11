<template>
  <b-form-group>
    <label>Device</label>
    <multiselect
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-bind:options="options"
      v-bind:multiple="true"
      v-bind:placeholder="placeholder"
      ></multiselect>
  </b-form-group>
</template>

<script>

export default {
	// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
	name: 'device-select',
	// https://vuejs.org/v2/style-guide/#Component-data-essential
	data () {
		return {
      options: [
        "Option 1",
        "Option 2"
      ]
		}
	},
	// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
	computed: {
    placeholder: function () {
      if (this.value.length > 0) {
        return "add more devices"
      } else {
        return "all devices"
      }
    }
	},
	// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
	props: {value: Array}
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
