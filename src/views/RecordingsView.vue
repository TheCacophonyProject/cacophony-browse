<template>
	<b-container>
		<QueryRecordings
		heading="Search Video Recordings"
		v-model="query"
		v-on:getRecordings="getRecordings"/>
		<div>
			{{ recordings }}
		</div>

	</b-container>
</template>

<script>

import QueryRecordings from '../components/QueryRecordings/QueryRecordings.vue'
import TableRecordings from '../components/TableRecordings.vue'
import api from '../api/index'

export default {
	// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
	name: 'recordings-view',
	// https://vuejs.org/v2/style-guide/#Component-data-essential
	data () {
		return {
			query: {},
			recordings: []
		}
	},
	// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
	computed: {
	},
	// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
	props: {},
	components: {QueryRecordings, TableRecordings},
	methods: {
		getRecordings() {
			let token = this.$store.state.User.JWT
			let limit = 100
			let offset = 0
			let tagMode = 'any'
			let tags = {}
			let query = this.query
			return new Promise((resolve, reject) => {
				api.recording.recording(token, limit, offset, tagMode, tags, query)
				.then(response => response.json())
				.then((json) => {
					if(!json.success) {
						reject(json)
					} else {
						this.recordings = json.rows
					}
				})
			})
		}
	}
}
</script>

<style>
.scrollable-menu {
    height: auto;
    max-height: 200px;
    overflow-x: hidden;
}
</style>
