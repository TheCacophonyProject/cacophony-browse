<template>
  <b-row>
    <b-col
      cols="12"
      lg="8">
      <ThermalVideoPlayer
        ref = "thermalPlayer"
        :video-url="videoUrl"
        :tracks="orderedTracks()"
        :current-track="selectedTrack"
        :colours="colours"
        @trackSelected="trackSelected($event)"
      />
      <PrevNext
        :recording="recording"
        @nextRecording="gotoNextRecording($event.direction, $event.tagMode, $event.tags)"/>
      <AddObservation
        ref = "addObs"
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
      <div
        v-if="tracks && tracks.length > 0">
        <h2 class="d-none d-lg-block">Tracks</h2>
        <div
          v-for="(track, index) in orderedTracks()"
          :key="index">
          <TrackInfo
            :track="track"
            :index="index"
            :num-tracks="tracks.length"
            :recording-id="getRecordingId()"
            :show="index==selectedTrack"
            :colour="colours[index % colours.length]"
            @trackSelected="trackSelected($event)"/>
        </div>
      </div>
      <div
        v-if="recording && recording['processingState'] != 'FINISHED'"
        class="processing">
        Recording still processing...
      </div>
      <h2 class="recording">Recording</h2>
      <RecordingProperties
        v-model="recording.comment"
        :download-raw-url="videoRawUrl"
        :download-file-url="videoUrl"
        :recording="recording"
        :tracks="tracks"
        @nextOrPreviousRecording="gotoNextRecording('either', 'any')"/>
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
/* eslint-disable no-console */
import {mapState} from 'vuex';
import PrevNext from './PrevNext.vue';
import AddObservation from './AddObservation.vue';
import ObservedAnimals from './ObservedAnimals.vue';
import ThermalVideoPlayer from './ThermalVideoPlayer.vue';
import TrackInfo from './Track.vue';
import RecordingProperties from './RecordingProperties.vue';
import VideoHelp from './VideoHelp.vue';

export default {
  name: 'VideoRecording',
  components: {PrevNext, AddObservation, ObservedAnimals, RecordingProperties, VideoHelp, ThermalVideoPlayer, TrackInfo},
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
      colours: [
        'yellow',
        'orange',
        'red',
        'purple',
        'lightblue',
        'limegreen',
        'black',
        'white',
      ],
    };
  },
  computed: {
    ...mapState({
      tagItems() {
        return this.$store.getters['Video/getTagItems'];
      },
    }),
  },
  watch: {
    recording: function() {
      this.trackSelected(0);
    },
  },
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
    trackSelected(track) {
      if (track != this.selectedTrack) {
        this.selectedTrack = track;
      }
    },
    orderedTracks: function() {
      return this.tracks.slice().sort((a, b) => a.data.start_s - b.data.start_s );
    },
  },
};
</script>

<style scoped>
  .tag-buttons, .img-buttons {
    padding: 0 5px;
  }

  .recording {
    margin-top: 20px;
  }

  .processing {
    color: darkred;
    font-weight: 600;
    font-size: 120%
  }

</style>

<style>
  @media only screen and (max-width: 575px) {
    .view .row {
      margin: 0;
    }

    .view .row .col-12 {
      padding: 0 5px;
    }
  }
</style>

