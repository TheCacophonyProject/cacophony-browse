<template>
  <div
    :class="trackClass()">
    <b-row
      class="track-header">
      <b-col
        cols="1"
        lg="0"
        title="Previous track"
        class="prev-track"
        @click="trackSelected(-1)">
        <font-awesome-icon
          v-if="index != 0"
          class="fa-2x"
          icon="angle-left"/>
      </b-col>
      <b-col
        cols="10"
        class="track-title">
        <h3
          @click="trackSelected(0)">
          <span
            v-html="trackImage()"/>
          Track {{ index + 1 }} - {{ track.data.label }}
        </h3>
      </b-col>
      <b-col
        cols="1"
        lg="2"
        title="Next track"
        class="next-track"
        @click="trackSelected(1)">
        <font-awesome-icon
          v-if="index < numTracks - 1"
          class="fa-2x"
          icon="angle-right"/>
      </b-col>
      {{ message }}
    </b-row>
    <div
      v-if="show"
      class="track-details">
      <TrackData
        :track-data="track.data"/>
      <QuickTagButtons
        v-show="true"
        @addTag="addTag($event)"
        @displayAddObservation="showAddObservation = true"/>
      <!-- <AddObservation
        v-show="showFullAddTag"
        ref = "addObs"
        :current-video-time="0"
        @get-current-video-time="getCurrentVideoTime()"
        @set-current-video-time="setCurrentVideoTime($event)"
        @addTag="addTag($event)"
        @hideAddObservations="showAddObservation = false" /> -->
      <TrackTags
        :items="track.TrackTags"
        @addTag="addTag($event)"
        @deleteTag="deleteTag($event)"/>
    </div>
  </div>
</template>

<script>
/* global require */
import TrackData from './TrackData.vue';
import QuickTagButtons from './QuickTagButtons.vue';
import TrackTags from './TrackTags.vue';

export default {
  name: 'Track',
  components: {
    TrackData, QuickTagButtons, TrackTags,
  },
  props: {
    track: {
      type: Object,
      required: true
    },
    recordingId: {
      type: Number,
      required: true
    },
    index: {
      type: Number,
      required: true,
    },
    numTracks: {
      type: Number,
      required: true,
    },
    show: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      display_all: false,
      showFullAddTag: false,
      message: "",
      tag: null
    };
  },
  computed: {
  },
  methods: {
    trackClass: function () {
      const selected = "selected-" + this.show;
      if ("tag" in this.track.data) {
        return selected;
      } else {
        return selected + " ignored";
      }
    },
    trackImage: function () {
      // Struggling to get images to show correctly so using work-around
      // suggested at bottom of this page.
      // TODO implement alternative that doesn't use 'require' in this manner
      // https://bootstrap-vue.js.org/docs/reference/images/
      let image = null;
      if ("tag" in this.track.data) {
        image = this.track.data.tag + '.png';
        try {
          const link = require('../../assets/video/' + image);
          return `<img class="track-image" src="${link}" />`;
        } catch (e) {
          return `<img class="track-image"/>`;
        }
      }
      return `<img class="track-image"/>`;
    },
    addTag(tag) {
      const recordingId = this.recordingId;
      const trackId = this.track.id;
      this.$store.dispatch('Video/ADD_TRACK_TAG', { tag, recordingId, trackId });
    },
    deleteTag(tag) {
      const recordingId = this.recordingId;
      this.$store.dispatch('Video/DELETE_TRACK_TAG', { tag, recordingId});
    },
    trackSelected(increment) {
      const index = this.index + increment;
      if (0 <= index && index < this.numTracks) {
        this.$emit('trackSelected', this.index + increment);
      }
    },
    headerClass() {
      return "selected-" + this.show;
    },
  },
};
</script>

<style scoped>
  .tracks {
    padding-left: 20px;
  }

  .tracks h3 {
    margin-bottom: 0;
  }

  .track-details >>> p {
    margin-bottom: .2em;
  }

  .track-details {
    font-size: 90%;
    margin-left: 30px;
    margin-top: -10px;
    padding: 5px;
    /* border: 1px solid lightgray; */
  }

  .track-title {
    padding-left: 0px;
    padding-right: 0px;
  }

  .selected-false {
    color: grey;
  }

  .selected-true {
    border: 1px solid lightgrey;
  }

  @media only screen and (max-width: 991px) {
    .selected-false >>> .track-header {
      display: none;
    }
  }

  @media only screen and (min-width: 992px) {
    .prev-track {
      display: none;
    }
  }

  .prev-track,
  .next-track {
    color: grey;
  }

  table {
    margin: 10px 30px;
    border-bottom: 1px solid #ddd;
  }

  th, td {
    border-top: 1px solid #ddd;
  }

  td {
    padding-right: 20px;
  }

  .title {
    font-weight: 550;
  }

  .details p {
    margin-bottom: 0;
  }

  .delta {
    color: gray;
  }

  .ignored {
    color: gray;
  }

  .tag-buttons {
    padding: 12px 0;
  }
</style>

<style>
 .track-image {
    max-width: 30px;
    max-height: 30px;
    width: auto;
    height: auto;
 }
</style>

