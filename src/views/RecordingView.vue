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
          <ThermalVideoPlayer
            ref = "thermalPlayer"
            :video-url="fileSource"
            :tracks="tracks"
            :current-track="selectedTrack"/>
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
        <template v-if="isVideo">
          <QuickTag
            v-show="!showAddObservation"
            class="d-none d-lg-block"
            @addTag="addTag($event)"
            @displayAddObservation="showAddObservation = true"/>
          <AddObservation
            v-show="showAddObservation"
            ref = "addObs"
            :current-video-time="0"
            @get-current-video-time="getCurrentVideoTime()"
            @set-current-video-time="setCurrentVideoTime($event)"
            @addTag="addTag($event)"
            @hideAddObservations="showAddObservation = false" />
          <ObservedAnimals
            :items="tagItems"
            class="d-none d-lg-block"
            @deleteTag="deleteTag($event)"
            @addTag="addTag($event)"/>
        </template>
      </b-col>

      <b-col
        cols="12"
        lg="4">
        <div
          v-if="isVideo">
          <h2 class="d-none d-lg-block">Tracks</h2>
          <div
            v-if="tracks">
            <!-- This Orderby no longer going to work either -->
            <!-- v-for="(track, index) in orderBy(tracks, 'start_s')" -->
            <div
              v-for="(track, index) in tracks"
              :key="index">
              <TrackInfo
                :track="track"
                :index="index"
                :num-tracks="tracks.length"
                :recording-id="getRecordingId()"
                :show="index==selectedTrack"
                @trackSelected="trackSelected($event)"/>
            </div>
          </div>
        </div>
        <h2>Recording</h2>
        <RecordingProperties
          v-model="recording.comment"
          :download-raw="downloadRawJWT"
          :download-file="downloadFileJWT"
          :recording="recording"
          :tracks="tracks"
          @nextOrPreviousRecording="gotoNextRecording('either', 'any')"/>
        <template
          v-if="isVideo">
          <QuickTag
            v-show="!showAddObservation"
            class="d-lg-none"
            @addTag="addTag($event)"
            @displayAddObservation="showAddObservation = true"/>
          <AddObservation
            v-show="showAddObservation"
            ref = "addObs"
            :current-video-time="0"
            class="d-lg-none"
            @get-current-video-time="getCurrentVideoTime()"
            @set-current-video-time="setCurrentVideoTime($event)"
            @addTag="addTag($event)"
            @hideAddObservations="showAddObservation = false" />
          <ObservedAnimals
            v-if="isVideo"
            :items="tagItems"
            class="d-lg-none"
            @deleteTag="deleteTag($event)"
            @addTag="addTag($event)"/>
        </template>
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
import ThermalVideoPlayer from '../components/Video/ThermalVideoPlayer.vue';
import TrackInfo from '../components/Video/Track.vue';
import RecordingProperties from '../components/Video/RecordingProperties.vue';
import VideoHelp from '../components/Video/VideoHelp.vue';

export default {
  name: 'RecordingView',
  components: {QuickTag, PrevNext, AddObservation, ObservedAnimals, RecordingProperties, VideoHelp, ThermalVideoPlayer, TrackInfo},
  props: {},
  data () {
    return {
      showAddObservation: false,
      showAlert: false,
      alertMessage: "",
      alertVariant: "",
      selectedTrack: 0,
      startVideoTime: 0,
    };
  },
  computed:
    mapState({
      recording: state => state.Video.recording,
      tracks: state => state.Video.tracks,
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
      this.$refs.addObs.currentVideoTime = this.$refs.thermalPlayer.player.currentTime;
    },
    setCurrentVideoTime(time) {
      this.startVideoTime = time;
    },
    trackSelected(track) {
      if (track != this.selectedTrack) {
        this.selectedTrack = track;
      }
    }
  }
};
</script>

<style scoped>
  .tag-buttons, .img-buttons {
    padding: 0 5px;
  }
</style>

<style src="video.js/dist/video-js.css"></style>