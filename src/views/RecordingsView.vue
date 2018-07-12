<template>
	<b-container>
		<QueryRecordings
		heading="Search Video Recordings"
		v-model="query"
		v-on:getRecordings="getRecordings"/>
		<TableRecordings v-bind:items="tableItems"/>

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
			recordings: [],
			tableItems: []
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
						json.rows.map((row) => {
							this.tableItems.push({
								view_link: this.parseViewLink(row.id),
								id: row.id,
								devicename: row.Device.devicename,
								groupname: row.Group.groupname,
								location: this.parseLocation(row.location),
								date: new Date(row.recordingDateTime).toLocaleDateString('en-NZ'),
								time: new Date(row.recordingDateTime).toLocaleTimeString(),
								duration: row.duration,
								tags: this.parseTags(row.Tags),
								other: '',
								processing_state: this.parseProcessingState(row.processingState)
							})
						})
						console.log(json.rows) //eslint-disable-line
					}
				})
			})
		},
		parseLocation(location) {
			if (location && typeof location === 'object') {
				let latitude = location.coordinates[0];
				let longitude = location.coordinates[1];
				return latitude + ', ' + longitude
			} else {
				return "(unknown)"
			}
		},
		parseTags(tags) {
			let animal = (tag) => {
				if (!tag.animal) {
					return "F/P"
				} else {
					return tag.animal
				}
			}
			let tagString = animal(tags[0])
			for (let i = 1; i < tags.length; i ++) {
				let animalName = animal(tags[i])
				tagString = tagString + ', ' + animalName
			}
			return tagString
		},
		parseProcessingState(result) {
			let string = result.toLowerCase();
			return string.charAt(0).toUpperCase() + string.slice(1);
		},
		parseViewLink(id) {
			id
			return "(view link here)"
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
