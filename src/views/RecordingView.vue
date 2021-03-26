<template>
  <b-container v-if="recording">
    <b-row>
      <b-col cols="12" lg="8" class="recording-details">
        <h4 class="recording-title">
          <font-awesome-icon
            icon="microchip"
            size="xs"
            style="color: #666; font-size: 16px"
          />
          {{ devicename }}
        </h4>

        <h5 class="text-muted">{{ date }}, {{ time }}</h5>

        <b-alert
          :show="showAlert"
          :variant="alertVariant"
          dismissible
          @dismissed="showAlert = false"
          >{{ alertMessage }}</b-alert
        >
      </b-col>
    </b-row>

    <template v-if="isAudio">
      <AudioRecording
        :recording="recording"
        :audio-url="fileSource"
        :audio-raw-url="rawSource"
      />
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
import config from "../config";
import { mapState } from "vuex";
import VideoRecording from "../components/Video/VideoRecording.vue";
import AudioRecording from "../components/Video/AudioRecording.vue";

export default {
  name: "RecordingView",
  components: { VideoRecording, AudioRecording },
  props: {},
  data() {
    return {
      showAlert: false,
      alertMessage: "",
      alertVariant: "",
    };
  },
  computed: {
    ...mapState({
      recording: (state) => state.Video.recording,
      tracks: (state) => state.Video.tracks,
      isVideo: (state) => state.Video.recording.type == "thermalRaw",
      isAudio: (state) => state.Video.recording.type == "audio",
      date: (state) => {
        if (state.Video.recording.recordingDateTime) {
          const date = new Date(state.Video.recording.recordingDateTime);
          return date.toDateString();
        }
        return "";
      },
      time: (state) => {
        if (state.Video.recording.recordingDateTime) {
          const date = new Date(state.Video.recording.recordingDateTime);
          return date.toLocaleTimeString();
        }
        return "";
      },
      devicename: (state) => {
        if (state.Video.recording.Device) {
          return state.Video.recording.Device.devicename;
        }
        return "";
      },
      fileSource: (state) => {
        return (
          (state.Video.downloadFileJWT &&
            `${config.api}/api/v1/signedUrl?jwt=${state.Video.downloadFileJWT}`) ||
          ""
        );
      },

      // TODO(jon): Api endpoint that doesn't require signedUrl etc, just uses usual auth, and we say which recording we want.
      // Fixes issue with videos timing out on tabs that are open for a while.

      rawSource: (state) =>
        `${config.api}/api/v1/signedUrl?jwt=${state.Video.downloadRawJWT}`,
    }),
  },
  created: async function () {
    await this.$store.dispatch("Video/GET_RECORDING", this.$route.params.id);
  },
};
</script>

<style lang="scss" scoped>
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.recording-details {
  h4,
  h5 {
    display: inline-block;
  }
  h4 {
    margin-right: 0.2em;
  }
}

@include media-breakpoint-down(md) {
  .recording-details {
    padding-top: 0.6rem;
    padding-bottom: 0.6rem;
  }
}

@include media-breakpoint-up(md) {
  .recording-details {
    padding-top: 1rem;
    padding-bottom: 0.9rem;
    h4,
    h5 {
      display: inline-block;
    }
  }
}
</style>
