<template>
	<b-container>
		<QueryRecordings heading="Search Video Recordings"/>


	</b-container>
</template>

<script>

import QueryRecordings from '../components/QueryRecordings/QueryRecordings.vue'

export default {
	// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
	name: 'recordings-view',
	// https://vuejs.org/v2/style-guide/#Component-data-essential
	data () {
		return {
		}
	},
	// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
	computed: {
	},
	// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
	props: {},
	components: {QueryRecordings}
}
</script>

<style>
.scrollable-menu {
    height: auto;
    max-height: 200px;
    overflow-x: hidden;
}
</style>
