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
    </b-row>

    <template v-if="isAudio">
      <AudioRecording
        :recording="recording"
        :audio-url="fileSource"
        :audio-raw-url="rawSource"/>
    </template>

    <template v-if="isVideo">
      <VideoRecording
        :recording="recording"
        :tracks="tracks"
        :video-url="fileSource"
        :video-raw-url="rawSource"
      />
    </template>

  </b-container>
  <b-container v-else>Loading...</b-container>
</template>

<script>
import config from '../config';
import {mapState} from 'vuex';
import VideoRecording from '../components/Video/VideoRecording.vue';
import AudioRecording from '../components/Video/AudioRecording.vue';

export default {
  name: 'RecordingView',
  components: {VideoRecording, AudioRecording},
  props: {},
  data () {
    return {
      showAlert: false,
      alertMessage: "",
      alertVariant: "",
    };
  },
  computed: {
    ...mapState({
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
  },
  created: async function() {
    await this.$store.dispatch('Video/GET_RECORDING', this.$route.params.id);
  },
};
</script>

<style scoped>
  .tag-buttons, .img-buttons {
    padding: 0 5px;
  }
</style>

