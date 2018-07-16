<template>
  <b-container>
    <h1>View Recording</h1>
    <h4>'{{ recording.Device.devicename }}' - {{ date }}, {{ time }}</h4>
    <video
      controls
      autoplay
      height="auto"
      max-width="100%"
      class="video">
      <source :src="fileSource" >
      Sorry, your browser does not support video playback.
    </video>
  </b-container>
</template>

<script>

import api from '../api/index'
import { Config } from '../../app.config' // eslint-disable-line

export default {
	// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
	name: 'GroupsView',
	// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
	props: {},
	// https://vuejs.org/v2/style-guide/#Component-data-essential
	data () {
		return {
			downloadFileJWT: null,
			downloadRawJWT: null,
			recording: {}
		}
	},
	// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
	computed: {
		date: function () {
			let date = new Date(this.recording.recordingDateTime)
			return date.toLocaleDateString('en-NZ')
		},
		time: function () {
			let date = new Date(this.recording.recordingDateTime)
			return date.toLocaleTimeString()
		},
		fileSource: function () {
			return `${Config.api}` + "/api/v1/signedUrl?jwt=" + this.downloadFileJWT
		},
		rawSource: function () {
			return `${Config.api}` + "/api/v1/signedUrl?jwt=" + this.downloadRawJWT
		}
	},
	created: function() {
			let token = this.$store.state.User.JWT
			return new Promise((resolve, reject) => {
				api.recording.id(this.$route.params.id, token)
				.then(response => response.json())
				.then((json) => {
					if(!json.success) {
						reject(json)
					} else {
						this.downloadFileJWT = json.downloadFileJWT
						this.downloadRawJWT = json.downloadRawJWT
						this.recording = json.recording
						console.log(json)//eslint-disable-line
					}
				})
			})

	}
}
</script>

<style scoped>

.video {
	max-width: 100%;
	height: auto;
}

</style>
