<template>
  <div>
    <b-container>
      <QueryRecordings
        v-model="query"
        heading="Search Video Recordings"
        @searchButton="searchButton"/>

      <b-form-row class="information-line">
        <b-col lg="4">
          <b-form-text>
            <h5 
              v-if="countMessage" 
              style="text-align: center;">
              {{ countMessage }}
            </h5>
          </b-form-text>
        </b-col>
        <b-col 
          md="6" 
          lg="4">
          <b-pagination
            v-if="count > perPage"
            :total-rows="count"
            v-model="currentPage"
            :per-page="perPage"
            :limit="limitPaginationButtons"
            class="pagination-buttons"
            align="center"
            @input="pagination" />
        </b-col>
        <b-col 
          md="6" 
          lg="4">
          <b-form-group>
            <b-form-select
              v-model="perPage"
              :options="perPageOptions"
              style="text-align: center;"
              @input="pagination"
            />
          </b-form-group>
        </b-col>
      </b-form-row>

    </b-container>
    <TableRecordings :items="tableItems"/>
    <b-pagination
      v-if="count > perPage"
      :total-rows="count"
      v-model="currentPage"
      :per-page="perPage"
      :limit="limitPaginationButtons"
      class="pagination-buttons"
      align="center"
      @input="pagination" />
  </div>
</template>

<script>

import QueryRecordings from '../components/QueryRecordings/QueryRecordings.vue'
import TableRecordings from '../components/TableRecordings.vue'
import api from '../api/index'

export default {
	// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
	name: 'RecordingsView',
	components: {QueryRecordings, TableRecordings},
	// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
	props: {},
	// https://vuejs.org/v2/style-guide/#Component-data-essential
	data () {
		return {
			query: {},
			recordings: [],
			tableItems: [],
			count: null,
			countMessage: null,
			currentPage: null,
			perPage: 100,
			limitPaginationButtons: 5,
			perPageOptions: [
				{value:10, text: "10 per page"},
				{value:50, text: "50 per page"},
				{value:100, text: "100 per page"},
				{value:500, text: "500 per page"},
				{value:1000, text: "1000 per page"}
			]
		}
	},
	// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
	computed: {
	},
	methods: {
		searchButton() {
			// Loading wheel here
			this.countMessage = ""
			this.currentPage = 1
			this.getRecordings()
		},
		pagination() {
			this.getRecordings()
		},
		getRecordings() {
			// Remove previous values
			this.recordings = []
			this.tableItems = []
			// Extract query options
			let token = this.$store.state.User.JWT
			let limit = this.perPage
			let offset = (this.currentPage - 1) * limit
			let tagMode = 'any'
			let tags = {}
			let query = this.query
			// Call API and process results
			return new Promise((resolve, reject) => {
				api.recording.query(token, limit, offset, tagMode, tags, query)
				.then(response => response.json())
				.then((json) => {
					if(!json.success) {
						reject(json)
					} else {
						this.recordings = json.rows
						this.count = json.count
						if (json.count > 0) {
						this.countMessage = `${json.count} matches found (total)`
						} else if (json.count === 0) {
						this.countMessage = 'No matches'
						}
						json.rows.map((row) => {
							this.tableItems.push({
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
		}
	}
}
</script>

<style scoped>

.information-line {
	padding-top: 5px;
	padding-bottom: 5px;
}
</style>
