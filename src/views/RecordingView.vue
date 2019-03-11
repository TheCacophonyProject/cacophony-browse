<template>
  <b-container v-if="recording">
    <b-row>
      <b-col cols="12">
        <h4>'{{ devicename }}' - {{ date }}, {{ time }}</h4>
      </b-col>

      <b-col
        cols="12"
        lg="8">
        <template v-if="isVideo">
          <div
            ref="container"
            class="container">
            <canvas
              ref="canvas"
              class="canvas"/>
            <video-player
              ref="player"
              :key="recording.id"
              :options="playerOptions"
              height="auto"
              class="video vjs-custom-skin"
              @seeking="seeking"
              @play="draw"/>
          </div>
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
        <template v-if="isAudio">
          <audio
            ref="player"
            :src="fileSource"
            controls
            autoplay
            class="audio"/>
        </template>
        <PrevNext
          :recording="recording"
          @nextRecording="gotoNextRecording($event.direction, $event.tagMode, $event.tags)"/>
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
          v-model="recording.comment"
          :download-raw="downloadRawJWT"
          :download-file="downloadFileJWT"
          :recording="recording"
          @nextOrPreviousRecording="gotoNextRecording('either', 'any')"/>
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
import {videoPlayer} from 'vue-video-player';

export default {
  name: 'RecordingView',
  components: {QuickTag, PrevNext, AddObservation, ObservedAnimals, VideoProperties, VideoHelp, videoPlayer},
  props: {},
  data () {
    return {
      showAddObservation: false,
      showAlert: false,
      alertMessage: "",
      alertVariant: "",
      currentVideoTime: 0,
      lastDisplayedVideoTime: 0,
      lastTrackFrame: 0,
      scale: 4,
      playerOptions: {
        autoplay: false,
        muted: true,
        width: '640px',
        playbackRates: [0.5, 1, 2, 4, 8],
        sources: [{
          type: "video/mp4",
        }],
      }
    };
  },
  computed:
    mapState({
      recording: state => state.Video.recording,
      downloadFileJWT: state => state.Video.downloadFileJWT,
      downloadRawJWT: state => state.Video.downloadRawJWT,
      isVideo: state => state.Video.recording.type == "thermalRaw",
      isAudio: state => state.Video.recording.type == "audio",
      date: (state) => {
        const date = new Date(state.Video.recording.recordingDateTime);
        return date.toLocaleDateString('en-NZ');
      },
      time: state => {
        const date = new Date(state.Video.recording.recordingDateTime);
        return date.toLocaleTimeString();
      },
      devicename: state => {
        if (state.Video.recording.Device) {
          return state.Video.recording.Device.devicename;
        }
        return "";
      },
      // TODO the filename isn't available when videojs tries to create the video, this gets round it.
      // the fact the file doesn't exist may also be the reason for the filetype being unsupported
      fileSource: state => `${config.api}/api/v1/signedUrl?jwt=${state.Video.downloadFileJWT}`,
      rawSource: state => `${config.api}/api/v1/signedUrl?jwt=${state.Video.downloadRawJWT}`,
      processingState: state => {
        const text = state.Video.recording.processingState.toLowerCase();
        return text == 'finished';
      },
      tagItems() {
        return this.$store.getters['Video/getTagItems'];
      }
    }),
  watch: {
    '$route' () {
      this.getRecordingDetails();
    },
    fileSource: function (newValue) {
      this.$data.playerOptions.sources[0].src = newValue;
    }
  },
  created: async function() {
    await this.getRecordingDetails();
  },
  methods: {
    seeking(event) {
      // If the user is moving the time slider on the video then update the canvas
      // as well so that it matches the underlying video frame.
      if(event.type === "seeking") {
        this.draw();
      }
    },
    displayText(context, text, rectWidth, rectHeight) {
      context.font = '12px Verdana';
      context.fillStyle = 'white';

      const textHeight = 12;
      const textWidth = context.measureText(text).width;

      // TODO Determine if the box can be shown right at the bottom of the screen
      // if it can then we probably need to detect this and display the text above
      // or inside the box.
      const x = rectWidth - textWidth;
      const y = rectHeight + textHeight;
      context.fillText(text, x, y);
    },
    displayBox(context, width, height) {
      context.beginPath();
      context.rect(0, 0, width, height);
      context.strokeStyle = 'yellow';
      context.stroke();
    },
    getCurrentVideoFrameData(currentTime) {
      const trackPos = this.recording.additionalMetadata.tracks[0].positions;
      if (currentTime < trackPos[this.lastTrackFrame][0]) {
        this.lastTrackFrame = 0;
      }

      for (let i = this.lastTrackFrame + 1; i < trackPos.length; i++) {
        if (currentTime > trackPos[i][0]) {
          this.lastTrackFrame = i;
        } else {
          break;
        }
      }

      if (this.lastTrackFrame == 0 && currentTime < trackPos[0][0]) {
        return {rectWidth: 0, rectHeight: 0, x: 0, y: 0, text:""};
      }

      if (this.lastTrackFrame == trackPos.length - 1 && currentTime > trackPos[this.lastTrackFrame][0] + 0.112) {
        return {rectWidth: 0, rectHeight: 0, x: 0, y: 0, text:""};
      }


      const rect = trackPos[this.lastTrackFrame][1];
      const rectWidth = rect[2] - rect[0];
      const rectHeight = rect[3] - rect[1];
      const x = rect[0];
      const y = rect[1];
      const text = 'Possum' + currentTime + "--" + this.lastTrackFrame;

      return {rectWidth, rectHeight, x, y, text};
    },
    shouldDraw() {
      const v = this.$refs.player;
      if (v === undefined || v.paused || v.ended) {
        return false;
      }
      this.draw();
    },
    draw() {
      const v = this.$refs.player;

      // Only update the canvas if the video time has changed as this means a new
      // video frame is being displayed.
      if (v.player.currentTime() !== this.lastDisplayedVideoTime) {
        const frameData = this.getCurrentVideoFrameData(v.player.currentTime());

        const canvas = this.$refs.canvas;
        const context = canvas.getContext('2d');

        const container = this.$refs.container;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        const ss = 4;

        // Clear the canvas before each new frame
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Translate the context so the top left corner of the rectangle is always (0,0)
        context.save();
        if (frameData) {
          context.translate(frameData.x * ss, frameData.y * ss);
          this.displayBox(context, frameData.rectWidth * ss, frameData.rectHeight * ss);
          this.displayText(context, frameData.text, frameData.rectWidth * ss, frameData.rectHeight * ss);
        }
        context.restore();

        this.lastDisplayedVideoTime = v.player.currentTime();
      }
      requestAnimationFrame(this.shouldDraw);
    },
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

.vjs-big-play-button {
  z-index: 1000;
}

.vjs-control-bar {
  z-index: 1000;
}

.video .video-js .vjs-volume-panel,
.video .video-js .vjs-fullscreen-control {
  display: none;
}

.audio {
  display: block;
  min-width: 100%;
  max-width: 100%;
}

.canvas {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  z-index: 999;
}

.container {
  position: relative;
  width: 640px;
  padding: 0;
}

</style>

<style src="video.js/dist/video-js.css"></style>