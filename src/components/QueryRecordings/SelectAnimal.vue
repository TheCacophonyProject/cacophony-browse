<template>
  <b-form-group>
    <label>Animals</label>
    <multiselect
      :value="value"
      :options="options"
      :multiple="true"
      :placeholder="placeholder"
      @input="$emit('input', $event)"/>
  </b-form-group>
</template>

<script>

export default {
	// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
	name: 'AnimalSelect',
	// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
	props: {
    value: {
      type: Array,
      required: true
    }
  },
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
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
