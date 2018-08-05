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
          ref="videoPlayer"
          :key="recording.id"
          controls
          autoplay
          max-width="100%"
          width="640"
          height="auto"
          class="video">
          <source :src="fileSource" >
          Sorry, your browser does not support video playback.
        </video>
        <QuickTag
          v-show="!showAddObservation"
          @addTag="addTag($event)"
          @displayAddObservation="showAddObservation = true"/>
        <AddObservation
          v-show="showAddObservation"
          :current-video-time="currentVideoTime"
          @get-current-video-time="getCurrentVideoTime()"
          @set-current-video-time="setCurrentVideoTime($event)"
          @addTag="addTag($event)"
          @hideAddObservations="showAddObservation = false"
        />
        <PrevNext
          :recording="recording"
          @nextRecording="nextRecording($event.direction, $event.tagMode, $event.tags)"/>
        <b-alert
          :show="showAlert"
          :variant="alertVariant"
          dismissible
          @dismissed="showAlert=false">{{ alertMessage }}</b-alert>
        <ObservedAnimals
          :items="tagItems"
          @deleteTag="deleteTag($event)"/>
      </b-col>

      <b-col
        cols="12"
        lg="4">
        <VideoProperties
          :processing-state="processingState"
          v-model="recording.comment"
          :download-raw="downloadRawJWT"
          :download-file="downloadFileJWT"
          @nextRecording="nextRecording('next', 'any')"/>
        <VideoHelp class="mt-2" />
      </b-col>

      <b-col cols="12"/>
    </b-row>
  </b-container>
</template>

<script>

import api from '../api/index';
import { Config } from '../../app.config';
import QuickTag from '../components/Video/QuickTag.vue';
import PrevNext from '../components/Video/PrevNext.vue';
import AddObservation from '../components/Video/AddObservation.vue';
import ObservedAnimals from '../components/Video/ObservedAnimals.vue';
import VideoProperties from '../components/Video/VideoProperties.vue';
import VideoHelp from '../components/Video/VideoHelp.vue';

export default {
  name: 'VideoView',
  components: {QuickTag, PrevNext, AddObservation, ObservedAnimals, VideoProperties, VideoHelp},
  props: {},
  data () {
    return {
      downloadFileJWT: null,
      downloadRawJWT: null,
      recording: null,
      showAddObservation: false,
      showAlert: false,
      alertMessage: "",
      alertVariant: "",
      currentVideoTime: 0
    };
  },
  computed: {
    date: function () {
      const date = new Date(this.recording.recordingDateTime);
      return date.toLocaleDateString('en-NZ');
    },
    time: function () {
      const date = new Date(this.recording.recordingDateTime);
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
      const tags = this.recording.Tags;
      const tagItems = [];
      tags.map((tag) => {
        const tagItem = {};
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
  watch: {
    '$route' () {
      this.getRecordingDetails();
    }
  },
  created: function() {
    this.getRecordingDetails();
  },
  methods: {
    async getRecordingDetails() {
      const response = await api.recording.id(this.$route.params.id);
      if(!response.success) {
        response.messages && response.messages.forEach(message => {
          this.$store.dispatch('Messaging/WARN', message);
        });
      } else {
        this.downloadFileJWT = response.downloadFileJWT;
        this.downloadRawJWT = response.downloadRawJWT;
        this.recording = response.recording;
      }
    },
    async addTag(tag) {
      const id = Number(this.$route.params.id);
      const response = await api.tag.addTag(tag, id);

      if(!response.success) {
        response.messages && response.messages.forEach(message => {
          this.$store.dispatch('Messaging/WARN', message);
        });
      } else {
        this.showAlert = true;
        this.alertMessage = "Tag added.";
        this.alertVariant = "success";
        this.getRecordingDetails();
      }
    },
    async deleteTag(tagId) {
      const response = api.tag.deleteTag(tagId);
      if(!response.success) {
        response.messages && response.messages.forEach(message => {
          this.$store.dispatch('Messaging/WARN', message);
        });
      } else {
        this.getRecordingDetails();
        this.showAlert = true;
        this.alertMessage = 'Tag deleted';
        this.alertVariant = 'success';
      }
    },
    async nextRecording(direction, tagMode, tags) {
      var params = {
        where: {
          DeviceId: this.recording.Device.id
        },
        limit: 1,
        offset: 0
      };
      if (tags) {
        params.where.tags = JSON.stringify(tags);
      }

      let order;
      switch (direction) {
      case "next":
        params.where.recordingDateTime = {gt: this.recording.recordingDateTime};
        order = "ASC";
        break;
      case "previous":
        params.where.recordingDateTime = {lt: this.recording.recordingDateTime};
        order = "DESC";
        break;
      default:
        throw `invalid direction: '${direction}'`;
      }
      params.order  = JSON.stringify([["recordingDateTime", order]]);
      params.where = JSON.stringify(params.where);

      const response = await api.recording.query(params);

      if(!response.success) {
        response.messages && response.messages.forEach(message => {
          this.$store.dispatch('Messaging/WARN', message);
        });
      } else {
        if (response.rows.length == 0) {
          this.showAlert = true;
          this.alertMessage = `No ${direction} recording for this device.`;
          this.alertVariant = 'warning';
          return;
        }
        this.$router.push({path: `/video/${response.rows[0].id}`});
      }
    },
    getCurrentVideoTime() {
      this.currentVideoTime = this.$refs.videoPlayer.currentTime;
    },
    setCurrentVideoTime(time) {
      this.$refs.videoPlayer.currentTime = time;
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
