<template>
	<b-container v-if="recording">
		<b-row>
			<b-col cols="12">
				<h1>View Recording</h1>
				<h4>'{{recording.Device.devicename}}' - {{date}}, {{time}}</h4>
			</b-col>

			<b-col cols="12" lg="8">
				<video
				controls
				autoplay
				height="auto"
				max-width="100%"
				class="video">
				<source v-bind:src="fileSource" />
				Sorry, your browser does not support video playback.
			</video>
			<QuickTag />
			<PrevNext />
			<ObservedAnimals v-bind:items="items"/>
			</b-col>

			<b-col cols="12" lg="4">
				<VideoProperties
				v-bind:processingState="processingState"
				v-bind:comment="recording.comment" />
				<VideoHelp class="mt-2" />
			</b-col>

			<b-col cols="12">
				<AddObservation v-show="manualAdd" />
			</b-col>
		</b-row>
	</b-container>
</template>

<script>

import api from '../api/index'
import { Config } from '../../app.config' // eslint-disable-line
import QuickTag from '../components/Video/QuickTag.vue'
import PrevNext from '../components/Video/PrevNext.vue'
import AddObservation from '../components/Video/AddObservation.vue'
import ObservedAnimals from '../components/Video/ObservedAnimals.vue'
import VideoProperties from '../components/Video/VideoProperties.vue'
import VideoHelp from '../components/Video/VideoHelp.vue'

export default {
	// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
	name: 'video-view',
	components: {QuickTag, PrevNext, AddObservation, ObservedAnimals, VideoProperties, VideoHelp},
	// https://vuejs.org/v2/style-guide/#Component-data-essential
	data () {
		return {
			downloadFileJWT: null,
			downloadRawJWT: null,
			recording: null,
			items: [
				{animal: 'dog', confidence: 0.6, who: 'Arthur', when: 'Today'},
				{animal: 'dog', confidence: 0.6, who: 'Arthur', when: 'Today'},
				{animal: 'dog', confidence: 0.6, who: 'Arthur', when: 'Today'},
				{animal: 'dog', confidence: 0.6, who: 'Arthur', when: 'Today'},
			],
			manualAdd: true
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
		},
		processingState: function () {
			let text = this.recording.processingState.toLowerCase();
			text = text.slice(0,1).toUpperCase() + text.slice(1)
			return text
		}
	},
	// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
	props: {},
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

<style>

.video {
	max-width: 100%;
	height: auto;
}

</style>
