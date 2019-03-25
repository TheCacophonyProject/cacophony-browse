<template>
  <b-container v-if="recording">
    <b-row>
      <b-col cols="12">
        <h4>'{{ devicename }}' - {{ date }}, {{ time }}</h4>
        <b-alert
          :show="showAlert"
          :variant="alertVariant"
          dismissible
          @dismissed="showAlert=false">{{ alertMessage }}</b-alert>
      </b-col>
      <template v-if="isAudio">
        <b-col
          cols="12"
          lg="8">
          <audio
            ref="player"
            :src="fileSource"
            controls
            autoplay
            class="audio"/>
          <PrevNext
            :recording="recording"
            @nextRecording="gotoNextRecording($event.direction, $event.tagMode, $event.tags)"/>
        </b-col>

        <b-col
          cols="12"
          lg="4">
          <h2>Recording</h2>
          <RecordingProperties
            v-model="recording.comment"
            :download-raw-url="fileSource"
            :download-file-url="rawSource"
            :recording="recording"
            :tracks="tracks"
            @nextOrPreviousRecording="gotoNextRecording('either', 'any')"/>
          <VideoHelp class="mt-2" />
        </b-col>
      </template>
    </b-row>

    <template v-if="isVideo">
      <VideoRecording
        :recording="recording"
        :tracks="tracks"
        :video-url="fileSource"
        :video-raw-url="rawSource"/>
    </template>

  </b-container>
</template>

<script>
import config from '../config';
import {mapState} from 'vuex';
import PrevNext from '../components/Video/PrevNext.vue';
import VideoRecording from '../components/Video/VideoRecording.vue';
import RecordingProperties from '../components/Video/RecordingProperties.vue';
import VideoHelp from '../components/Video/VideoHelp.vue';

export default {
  name: 'RecordingView',
  components: {PrevNext, RecordingProperties, VideoHelp, VideoRecording},
  props: {},
  data () {
    return {
      showAlert: false,
      alertMessage: "",
      alertVariant: "",
    };
  },
  computed:
    mapState({
      recording: state => state.Video.recording,
      tracks: state => state.Video.tracks,
      isVideo: state => state.Video.recording.type == "thermalRaw",
      isAudio: state => state.Video.recording.type == "audio",
      date: (state) => {
        if (state.Video.recording.recordingDateTime) {
          const date = new Date(state.Video.recording.recordingDateTime);
          return date.toLocaleDateString('en-NZ');
        }
        return "";
      },
      time: state => {
        if (state.Video.recording.recordingDateTime) {
          const date = new Date(state.Video.recording.recordingDateTime);
          return date.toLocaleTimeString();
        }
        return "";
      },
      devicename: state => {
        if (state.Video.recording.Device) {
          return state.Video.recording.Device.devicename;
        }
        return "";
      },
      fileSource: state => `${config.api}/api/v1/signedUrl?jwt=${state.Video.downloadFileJWT}`,
      rawSource: state => `${config.api}/api/v1/signedUrl?jwt=${state.Video.downloadRawJWT}`,
    }),
  watch: {
    '$route' () {
      this.recording = null;
      this.tracks = null;
      this.getRecordingDetails();
    },
  },
  created: async function() {
    await this.getRecordingDetails();
  },
  methods: {
    getRecordingId() {
      return Number(this.$route.params.id);
    },
    getRecordingDetails() {
      this.$store.dispatch('Video/GET_RECORDING', this.$route.params.id);
    },
    async gotoNextRecording(direction, tagMode, tags, skipMessage) {
      if (await this.getNextRecording(direction, tagMode, tags, skipMessage)) {
        this.$router.push({path: `/recording/${this.recording.id}`});
      }
    },
    async getNextRecording(direction, tagMode, tags, skipMessage) {
      let where = {
        DeviceId: this.recording.Device.id
      };

      let order;
      switch (direction) {
      case "next":
        where.recordingDateTime = {"$gt": this.recording.recordingDateTime};
        order = "ASC";
        break;
      case "previous":
        where.recordingDateTime = {"$lt": this.recording.recordingDateTime};
        order = "DESC";
        break;
      case "either":
        if (await this.getNextRecording('next', tagMode, tags, true)) {
          return true;
        }
        return await this.getNextRecording('previous', tagMode, tags, skipMessage);
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

      if (tags) {
        params.tags = JSON.stringify(tags);
      }
      if (tagMode) {
        params.tagMode = tagMode;
      }

      return await this.$store.dispatch('Video/QUERY_RECORDING', { params, direction, skipMessage });
    },
  }
};
</script>

<style scoped>
  .tag-buttons, .img-buttons {
    padding: 0 5px;
  }
</style>

