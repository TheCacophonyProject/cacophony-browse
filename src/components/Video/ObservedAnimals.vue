<template>
  <b-table striped hover v-bind:items="items" />
</template>

<script>

export default {
	// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
	name: 'observed-animals',
	// https://vuejs.org/v2/style-guide/#Component-data-essential
	data () {
		return {
      fields: [
        {key: 'animal', label: 'Animal'},
        {key: 'confidence', label: 'Confidence'},
        {key: 'who', label: 'By Who'},
        {key: 'when', label: 'When'}
      ]
		}
	},
	// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
	computed: {

	},
	// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
	props: {
    items: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>

</style>
