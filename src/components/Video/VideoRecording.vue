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
        @nextOrPreviousRecording="prevNext"/>
      <RecordingControls
        :items="tagItems"
        :comment="recording.comment"
        :download-raw-url="videoRawUrl"
        :download-file-url="videoUrl"
        @deleteTag="deleteTag($event)"
        @addTag="addTag($event)"
        @updateComment="updateComment($event)"
        @nextOrPreviousRecording="gotoNextRecording('either', 'any')"/>
    </b-col>

    <b-col
      cols="12"
      lg="4">
      <div
        v-if="tracks && tracks.length > 0">
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
      <RecordingProperties
        :recording="recording"/>
    </b-col>
  </b-row>
</template>

<script>
/* eslint-disable no-console */
import {mapState} from 'vuex';
import PrevNext from './PrevNext.vue';
import RecordingControls from './RecordingControls.vue';
import ThermalVideoPlayer from './ThermalVideoPlayer.vue';
import TrackInfo from './Track.vue';
import RecordingProperties from './RecordingProperties.vue';

export default {
  name: 'VideoRecording',
  components: {PrevNext, RecordingControls, RecordingProperties, ThermalVideoPlayer, TrackInfo},
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
    prevNext(event) {
      this.gotoNextRecording(event[0], event[1], event[2]);
    },
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
    updateComment(comment) {
      const recordingId = Number(this.$route.params.id);
      this.$store.dispatch('Video/UPDATE_COMMENT', { comment, recordingId });
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

