<template>
  <b-form-group>
    <label>Animals</label>
    <multiselect
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-bind:options="options"
      v-bind:multiple="true"
      v-bind:placeholder="placeholder"></multiselect>
  </b-form-group>
</template>

<script>

export default {
	// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
	name: 'animal-select',
	// https://vuejs.org/v2/style-guide/#Component-data-essential
	data () {
		return {
      thisvalue: ["interesting", "possum"],
      options: [
        "interesting",
        "possum",
        "rat",
        "stoat",
        "ferret",
        "weasel",
        "hedgehog",
        "cat",
        "bird",
        "bird/kiwi",
        "dog",
        "hare",
        "human",
        "insect",
        "mouse",
        "rabbit",
        "spider",
        "other",
        "false-positive",
        "unidentified",
      ]
		}
	},
	// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
	computed: {
    placeholder: function () {
      if (this.value.length > 0) {
        return "add more animals"
      } else {
        return "all animals"
      }
    }
	},
	// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
	props: {value: Array}
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
