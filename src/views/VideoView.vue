<template>
  <b-container v-if="recording">
    <b-row>
      <b-col cols="12">
        <h1>View Recording</h1>
        <h4>'{{ recording.Device.devicename }}' - {{ date }}, {{ time }}</h4>
      </b-col>

      <b-col
        cols="12"
        lg="8">
        <video
          controls
          autoplay
          max-width="100%"
          width="640"
          height="auto"
          class="video">
          <source :src="fileSource" >
          Sorry, your browser does not support video playback.
        </video>
        <QuickTag @addTag="addTag($event)"/>
        <PrevNext />
        <ObservedAnimals
          :items="tagItems"
          @deleteTag="deleteTag($event)"/>
      </b-col>

      <b-col
        cols="12"
        lg="4">
        <VideoProperties
          :processing-state="processingState"
          :comment="recording.comment" />
        <VideoHelp class="mt-2" />
      </b-col>

      <b-col cols="12">
        <AddObservation v-show="manualAdd" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

import api from '../api/index';
import { Config } from '../../app.config' // eslint-disable-line
import QuickTag from '../components/Video/QuickTag.vue';
import PrevNext from '../components/Video/PrevNext.vue';
import AddObservation from '../components/Video/AddObservation.vue';
import ObservedAnimals from '../components/Video/ObservedAnimals.vue';
import VideoProperties from '../components/Video/VideoProperties.vue';
import VideoHelp from '../components/Video/VideoHelp.vue';

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'VideoView',
  components: {QuickTag, PrevNext, AddObservation, ObservedAnimals, VideoProperties, VideoHelp},
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {},
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data () {
    return {
      downloadFileJWT: null,
      downloadRawJWT: null,
      recording: null,
      manualAdd: false
    };
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {
    date: function () {
      let date = new Date(this.recording.recordingDateTime);
      return date.toLocaleDateString('en-NZ');
    },
    time: function () {
      let date = new Date(this.recording.recordingDateTime);
      return date.toLocaleTimeString();
    },
    fileSource: function () {
      return `${Config.api}` + "/api/v1/signedUrl?jwt=" + this.downloadFileJWT;
    },
    rawSource: function () {
      return `${Config.api}` + "/api/v1/signedUrl?jwt=" + this.downloadRawJWT;
    },
    processingState: function () {
      let text = this.recording.processingState.toLowerCase();
      text = text.slice(0,1).toUpperCase() + text.slice(1);
      return text;
    },
    tagItems: function () {
      let tags = this.recording.Tags;
      let tagItems = [];
      tags.map((tag) => {
        let tagItem = {};
        if (tag.animal) {
          tagItem.animal = tag.animal;
        } else {
          tagItem.animal = "none";
        }
        tagItem.event = tag.event;
        if (tag.confidence) {
          tagItem.confidence = tag.confidence.toFixed(2);
        }
        if (tag.automatic) {
          tagItem.who = "Cacophony AI";
          tagItem['_rowVariant'] = 'warning';
        } else {
          tagItem.who = tag.taggerId;
        }
        tagItem.when = new Date(tag.createdAt).toLocaleString();
        tagItem.tag = tag;
        tagItems.push(tagItem);
      });
      return tagItems;
    }
  },
  created: function() {
    this.getRecordingDetails();
  },
  methods: {
    getRecordingDetails() {
      let token = this.$store.state.User.JWT;
      return new Promise((resolve, reject) => {
        api.recording.id(this.$route.params.id, token)
          .then(response => response.json())
          .then((json) => {
            if(!json.success) {
              reject(json);
            } else {
              this.downloadFileJWT = json.downloadFileJWT;
              this.downloadRawJWT = json.downloadRawJWT;
              this.recording = json.recording;
              console.log('Recording details loaded:', json);
            }
          });
      });
    },
    addTag(tag) {
      let token = this.$store.state.User.JWT;
      let id = Number(this.$route.params.id);
      return new Promise((resolve, reject) => {
        api.tag.addTag(tag, id, token)
          .then(response => response.json())
          .then((json) => {
            if(!json.success) {
              reject(json);
            } else {
              console.log('New tag added:', json);
              this.getRecordingDetails();
              resolve(json);
            }
          });
      });
    },
    deleteTag(tagId) {
      let token = this.$store.state.User.JWT;
      return new Promise((resolve, reject) => {
        api.tag.deleteTag(tagId, token)
          .then(response => response.json())
          .then((json) => {
            if(!json.success) {
              reject(json);
            } else {
              console.log('Tag removed:', json);
              this.getRecordingDetails();
              resolve(json);
            }
          });
      });
    }
  }
};
</script>

<style>

.video {
	max-width: 100%;
	height: auto;
}

</style>
