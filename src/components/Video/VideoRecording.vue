<template>
  <b-row>
    <b-col
      cols="12"
      lg="8">
      <ThermalVideoPlayer
        ref = "thermalPlayer"
        :video-url="videoUrl"
        :tracks="tracks"
        :current-track="selectedTrack"/>
      <PrevNext
        :recording="recording"
        @nextRecording="gotoNextRecording($event.direction, $event.tagMode, $event.tags)"/>
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
    </b-col>

    <b-col
      cols="12"
      lg="4">
      <h2 class="d-none d-lg-block">Tracks</h2>
      <div
        v-if="tracks">
        <div
          v-for="(track, index) in orderBy(tracks, 'data.start_s')"
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
      <h2>Recording</h2>
      <RecordingProperties
        v-model="recording.comment"
        :download-raw-url="videoRawUrl"
        :download-file-url="videoUrl"
        :recording="recording"
        :tracks="tracks"
        @nextOrPreviousRecording="gotoNextRecording('either', 'any')"/>
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
        :items="tagItems"
        class="d-lg-none"
        @deleteTag="deleteTag($event)"
        @addTag="addTag($event)"/>
      <VideoHelp class="mt-2" />
    </b-col>
  </b-row>
</template>

<script>
import {mapState} from 'vuex';
import QuickTag from './QuickTag.vue';
import PrevNext from './PrevNext.vue';
import AddObservation from './AddObservation.vue';
import ObservedAnimals from './ObservedAnimals.vue';
import ThermalVideoPlayer from './ThermalVideoPlayer.vue';
import TrackInfo from './Track.vue';
import RecordingProperties from './RecordingProperties.vue';
import VideoHelp from './VideoHelp.vue';
import Vue2Filters from 'vue2-filters';

export default {
  name: 'VideoRecording',
  components: {QuickTag, PrevNext, AddObservation, ObservedAnimals, RecordingProperties, VideoHelp, ThermalVideoPlayer, TrackInfo},
  mixins: [Vue2Filters.mixin],
  props: {
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
  data () {
    return {
      showAddObservation: false,
      selectedTrack: 0,
      startVideoTime: 0,
    };
  },
  computed:
    mapState({
      tagItems() {
        return this.$store.getters['Video/getTagItems'];
      }
    }),
  methods: {
    getRecordingId() {
      return Number(this.$route.params.id);
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

