<template>
  <div
    :class="trackClass()">
    <div
      @click="trackSelected()">
      <h3>
        <span v-html="trackImage()"/>
        {{ index + 1 }} - {{ track.data.label }}
      </h3>
      {{ message }}
    </div>
    <!-- v-if="isVideo" -->
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
      if ("tag" in this.track.data) {
        return "";
      } else {
        return "ignored";
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
    trackSelected() {
      this.$emit('trackSelected', this.index);
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

  .track-details {
    font-size: 85%;
    margin-left: 30px;
    margin-top: -10px;
    padding: 5px;
    /* border: 1px solid lightgray; */
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
</style>

<style>
 .track-image {
    max-width: 30px;
    max-height: 30px;
    width: auto;
    height: auto;
 }
</style>

