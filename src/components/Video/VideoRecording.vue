<template>
  <b-container class="video-elements-wrapper">
    <b-row class="no-gutters">
      <b-col cols="12" lg="8">
        <ThermalVideoPlayer
          v-if="false"
          ref="thermalPlayer"
          :video-url="videoUrl"
          :tracks="orderedTracks"
          @track-selected="trackSelected"
          :current-track="selectedTrack"
          @request-next-recording="nextRecording"
        />
        <CptvPlayer
          v-else
          :cptv-url="videoRawUrl"
          :cptv-size="rawSize"
          :tracks="orderedTracks"
          :recording="recording"
          :current-track="selectedTrack"
          :recently-added-tag="recentlyAddedTrackTag"
          @track-selected="trackSelected"
          @received-header="gotHeader"
        />
      </b-col>

      <b-col cols="12" lg="4">
        <div v-if="tracks && tracks.length > 0" class="accordion">
          <TrackInfo
            v-for="(track, index) in orderedTracks"
            :key="index"
            :track="track"
            :index="index"
            :num-tracks="tracks.length"
            :recording-id="getRecordingId()"
            :is-wallaby-project="isWallabyProject()"
            :show="index === selectedTrack.trackIndex"
            :colour="colours[index % colours.length]"
            :adjust-timespans="timespanAdjustment"
            @track-selected="trackSelected"
            @change-tag="changedTrackTag"
          />
        </div>
        <div
          v-if="recording && recording['processingState'] !== 'FINISHED'"
          class="processing"
        >
          Recording still processing...
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" lg="8">
        <PrevNext :recording="recording" @nextOrPreviousRecording="prevNext" />
        <RecordingControls
          :items="tagItems"
          :comment="recording.comment"
          :download-raw-url="videoRawUrl"
          :download-file-url="videoUrl"
          @deleteTag="deleteTag($event)"
          @addTag="addTag($event)"
          @updateComment="updateComment($event)"
          @nextOrPreviousRecording="gotoNextRecording('either', 'any')"
        />
      </b-col>
      <b-col cols="12" lg="4">
        <RecordingProperties :recording="recording" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
/* eslint-disable no-console */
import { mapState } from "vuex";
import PrevNext from "./PrevNext.vue";
import RecordingControls from "./RecordingControls.vue";
import ThermalVideoPlayer from "./ThermalVideoPlayer.vue";
import TrackInfo from "./Track.vue";
import CptvPlayer from "@/components/Video/CptvPlayer";
import RecordingProperties from "./RecordingProperties.vue";
import { TagColours, WALLABY_GROUP } from "@/const";

export default {
  name: "VideoRecording",
  components: {
    PrevNext,
    RecordingControls,
    RecordingProperties,
    ThermalVideoPlayer,
    TrackInfo,
    CptvPlayer,
  },
  props: {
    trackid: {
      type: Number,
      require: false,
    },
    recording: {
      type: Object,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    videoRawUrl: {
      type: String,
      required: true,
    },
    tracks: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      showAddObservation: false,
      selectedTrack: { trackIndex: 0 },
      recentlyAddedTrackTag: null,
      startVideoTime: 0,
      colours: TagColours,
      header: null,
    };
  },
  computed: {
    ...mapState({
      tagItems() {
        return this.$store.getters["Video/getTagItems"];
      },
      rawSize: (state) => state.Video.rawSize,
    }),
    timespanAdjustment() {
      if (this.header) {
        if (this.header.hasBackgroundFrame) {
          return 1 / this.header.fps;
        }
      }
      return 0;
    },
    orderedTracks() {
      return ([...this.tracks] || []).sort(
        (a, b) => a.data.start_s - b.data.start_s
      );
    },
  },
  mounted() {
    this.selectedTrack = {
      trackIndex: this.getSelectedTrack(),
    };
  },
  watch: {
    recording() {
      this.trackSelected(0);
    },
    tracks() {
      this.selectedTrack = {
        trackIndex: this.getSelectedTrack(),
      };
    },
  },

  methods: {
    orderTracks() {
      return ([...this.tracks] || []).sort(
        (a, b) => a.data.start_s - b.data.start_s
      );
    },
    getSelectedTrack() {
      if (this.$route.params.trackid) {
        const index = this.orderTracks().findIndex(
          (track) => track.id === this.$route.params.trackid
        );
        if (index > -1) {
          return index;
        }
      }
      return 0;
    },
    async gotoNextRecording(direction, tagMode, tags, skipMessage) {
      const searchQueryCopy = JSON.parse(JSON.stringify(this.$route.query));
      if (await this.getNextRecording(direction, tagMode, tags, skipMessage)) {
        this.$router.push({
          path: `/recording/${this.recording.id}`,
          query: searchQueryCopy,
        });
      }
    },
    async getNextRecording(direction, tagMode, tags, skipMessage) {
      const params = JSON.parse(JSON.stringify(this.$route.query));

      let order;
      switch (direction) {
        case "next":
          params.to = null;
          params.from = this.recording.recordingDateTime;
          order = "ASC";
          break;
        case "previous":
          params.from = null;
          params.to = this.recording.recordingDateTime;
          order = "DESC";
          break;
        case "either":
          if (await this.getNextRecording("next", tagMode, tags, true)) {
            return true;
          }
          return await this.getNextRecording(
            "previous",
            tagMode,
            tags,
            skipMessage
          );
        default:
          throw `invalid direction: '${direction}'`;
      }
      params.order = JSON.stringify([["recordingDateTime", order]]);

      params.limit = 1;
      params.type = "video";
      delete params.offset;

      return await this.$store.dispatch("Video/QUERY_RECORDING", {
        params,
        skipMessage,
      });
    },
    prevNext(event) {
      this.gotoNextRecording(event[0], event[1], event[2]);
    },
    nextRecording() {
      this.gotoNextRecording("next", false, false, true);
    },
    getRecordingId() {
      return Number(this.$route.params.id);
    },
    isWallabyProject() {
      return this.recording.GroupId === WALLABY_GROUP;
    },
    addTag(tag) {
      const id = Number(this.$route.params.id);
      this.$store.dispatch("Video/ADD_TAG", { tag, id });
    },
    deleteTag(tagId) {
      this.$store.dispatch("Video/DELETE_TAG", tagId);
    },
    changedTrackTag(trackTag) {
      this.recentlyAddedTrackTag = trackTag;
      setTimeout(() => {
        this.recentlyAddedTrackTag = null;
      }, 2000);
    },
    trackSelected(track) {
      this.selectedTrack = track;
    },
    gotHeader(header) {
      this.header = header;
    },
    updateComment(comment) {
      const recordingId = Number(this.$route.params.id);
      this.$store.dispatch("Video/UPDATE_COMMENT", {
        comment,
        recordingId,
      });
    },
  },
};
</script>

<style scoped>
.video-elements-wrapper {
  padding: 0;
}
.processing {
  color: darkred;
  font-weight: 600;
  font-size: 120%;
}
</style>
