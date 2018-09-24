<template>
  <b-container v-if="recording">
    <b-row>
      <b-col cols="12">
        <h4>'{{ recording.Device.devicename }}' - {{ date }}, {{ time }}</h4>
      </b-col>

      <b-col
        cols="12"
        lg="8">
        <template v-if="isVideo">
          <video
            ref="player"
            :key="recording.id"
            controls
            autoplay
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
            @hideAddObservations="showAddObservation = false" />
        </template>
        <template v-else>
          <audio
            ref="player"
            :src="fileSource"
            controls
            autoplay
            class="audio"/>
        </template>
        <PrevNext
          :recording="recording"
          @nextRecording="nextRecording($event.direction, $event.tagMode, $event.tags)"/>
        <b-alert
          :show="showAlert"
          :variant="alertVariant"
          dismissible
          @dismissed="showAlert=false">{{ alertMessage }}</b-alert>
        <ObservedAnimals
          v-if="isVideo"
          :items="tagItems"
          @deleteTag="deleteTag($event)"
          @addTag="addTag($event)"/>
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
import config from '../config';
import {mapState} from 'vuex';
import QuickTag from '../components/Video/QuickTag.vue';
import PrevNext from '../components/Video/PrevNext.vue';
import AddObservation from '../components/Video/AddObservation.vue';
import ObservedAnimals from '../components/Video/ObservedAnimals.vue';
import VideoProperties from '../components/Video/VideoProperties.vue';
import VideoHelp from '../components/Video/VideoHelp.vue';

export default {
  name: 'RecordingView',
  components: {QuickTag, PrevNext, AddObservation, ObservedAnimals, VideoProperties, VideoHelp},
  props: {},
  data () {
    return {
      showAddObservation: false,
      showAlert: false,
      alertMessage: "",
      alertVariant: "",
      currentVideoTime: 0
    };
  },
  computed:
    mapState({
      recording: state => state.Video.recording,
      downloadFileJWT: state => state.Video.downloadFileJWT,
      downloadRawJWT: state => state.Video.downloadRawJWT,
      isVideo: state => state.Video.recording.type == "thermalRaw",
      date: (state) => {
        const date = new Date(state.Video.recording.recordingDateTime);
        return date.toLocaleDateString('en-NZ');
      },
      time: state => {
        const date = new Date(state.Video.recording.recordingDateTime);
        return date.toLocaleTimeString();
      },
      fileSource: state => `${config.api}/api/v1/signedUrl?jwt=${state.Video.downloadFileJWT}`,
      rawSource: state => `${config.api}/api/v1/signedUrl?jwt=${state.Video.downloadRawJWT}`,
      processingState: state => {
        let text = state.Video.recording.processingState.toLowerCase();
        text = text.slice(0,1).toUpperCase() + text.slice(1);
        return text;
      },
      tagItems() {
        return this.$store.getters['Video/getTagItems'];
      }
    }),
  watch: {
    '$route' () {
      this.getRecordingDetails();
    }
  },
  created: async function() {
    await this.getRecordingDetails();
  },
  methods: {
    getRecordingDetails() {
      this.$store.dispatch('Video/GET_RECORDING', this.$route.params.id);
    },
    addTag(tag) {
      const id = Number(this.$route.params.id);
      this.$store.dispatch('Video/ADD_TAG', { tag, id });
    },
    deleteTag(tagId) {
      this.$store.dispatch('Video/DELETE_TAG', tagId);
    },
    async nextRecording(direction, tagMode, tags) {
      let where = {
        DeviceId: this.recording.Device.id
      };

      if (tags) {
        where.tags = JSON.stringify(tags);
      }

      let order;
      switch (direction) {
      case "next":
        where.recordingDateTime = {gt: this.recording.recordingDateTime};
        order = "ASC";
        break;
      case "previous":
        where.recordingDateTime = {lt: this.recording.recordingDateTime};
        order = "DESC";
        break;
      default:
        throw `invalid direction: '${direction}'`;
      }
      order  = JSON.stringify([["recordingDateTime", order]]);
      where = JSON.stringify(where);

      const params ={
        where,
        order,
        limit: 1,
        offset: 0
      };

      await this.$store.dispatch('Video/QUERY_RECORDING', { params, direction });
      this.$router.push({path: `/recording/${this.recording.id}`});
    },
    getCurrentVideoTime() {
      this.currentVideoTime = this.$refs.player.currentTime;
    },
    setCurrentVideoTime(time) {
      this.$refs.player.currentTime = time;
    }
  }
};
</script>

<style>

.video {
  min-width: 100%;
  max-width: 100%;
  height: auto;
}

.audio {
  display: block;
  min-width: 100%;
  max-width: 100%;
}

</style>
