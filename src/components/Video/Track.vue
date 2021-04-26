<template>
  <div :class="['card', trackClass]">
    <div class="card-header">
      <button
        v-if="index !== 0"
        title="Previous track"
        class="prev-track button btn"
        @click="trackSelected(-1)"
      >
        <font-awesome-icon icon="angle-left" />
      </button>
      <h5 class="track-title" @click="trackSelected(0)">
        <span :style="iconStyle" class="track-image border" />
        Track {{ index + 1 }}
        <span class="out-of-tracks">/ {{ numTracks }}</span>
      </h5>
      <div class="track-time" @click="trackSelected(0)">
        <span class="title">Time:</span>
        {{ Math.max(0, track.data.start_s - adjustTimespans).toFixed(1) }} -
        {{ (track.data.end_s - adjustTimespans).toFixed(1) }}s <br />
        <span class="delta">
          (&#916;
          {{ (track.data.end_s - track.data.start_s).toFixed(1) }}s)
        </span>
      </div>
      <button
        v-if="index < numTracks - 1 && show"
        title="Next track"
        class="next-track button btn"
        @click="trackSelected(1)"
      >
        <font-awesome-icon icon="angle-right" />
      </button>
      {{ message }}
    </div>
    <div v-if="show" class="card-body">
      <AIClassification
        :tags="track.TrackTags"
        :is-wallaby-project="isWallabyProject"
        :needs-confirmation="!hasUserTags"
        :userTags="userTags"
        @confirm-ai-guess="({ what }) => addTag({ what, confidence: 0.85 })"
        @reject-ai-guess="promptUserToAddTag"
      />
      <b-alert
        class="user-tagging-hint"
        fade
        :show="showUserTaggingHintCountDown"
        variant="warning"
        dismissible
        @dismissed="showUserTaggingHintCountDown = false"
      >
        Click a classification button below to help teach the AI what this
        <em>really</em> is.
      </b-alert>
      <QuickTagTrack
        :tags="track.TrackTags"
        :is-wallaby-project="isWallabyProject"
        @addTag="addTag($event)"
        @deleteTag="deleteTag($event)"
      />
      <AddCustomTrackTag @addTag="addTag($event)" />
      <div v-if="isSuperUser">
        <TrackTags
          :items="track.TrackTags"
          @addTag="addTag($event)"
          @deleteTag="deleteTag($event)"
        />
        <TrackData :track-data="track.data" />
      </div>
    </div>
  </div>
</template>

<script>
import TrackData from "./TrackData.vue";
import QuickTagTrack from "./QuickTagTrack.vue";
import TrackTags from "./TrackTags.vue";
import AddCustomTrackTag from "./AddCustomTrackTag.vue";
import AIClassification from "./AIClassification.vue";

export default {
  name: "Track",
  components: {
    TrackData,
    QuickTagTrack,
    TrackTags,
    AddCustomTrackTag,
    AIClassification,
  },
  props: {
    track: {
      type: Object,
      required: true,
    },
    recordingId: {
      type: Number,
      required: true,
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
    },
    colour: {
      type: String,
      default: "yellow",
    },
    isWallabyProject: {
      type: Boolean,
      default: false,
    },
    adjustTimespans: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      show_details: false,
      showFullAddTag: false,
      message: "",
      showUserTaggingHintCountDown: false,
    };
  },
  computed: {
    trackClass() {
      const selected = "selected-" + this.show;
      if ("tag" in this.track.data) {
        return selected;
      } else {
        return selected + " ignored";
      }
    },
    iconStyle() {
      return `background-color: ${this.colour}`;
    },
    hasUserTags() {
      return (
        this.track.TrackTags.find(({ User }) => User !== null) !== undefined
      );
    },
    userTags() {
      return this.track.TrackTags.filter(({ User }) => User !== null).map(
        ({ what }) => what
      );
    },
    isSuperUser() {
      return this.$store.state.User.userData.isSuperUser;
    },
  },
  methods: {
    addTag(tag) {
      const recordingId = this.recordingId;
      const trackId = this.track.id;
      this.$store
        .dispatch("Video/ADD_TRACK_TAG", {
          tag,
          recordingId,
          trackId,
        })
        .then(() => {
          this.$emit("change-tag", { trackIndex: this.index, tag });
        });
    },
    promptUserToAddTag() {
      this.showUserTaggingHintCountDown = true;
    },
    deleteTag(tag) {
      const recordingId = this.recordingId;
      this.$store
        .dispatch("Video/DELETE_TRACK_TAG", {
          tag,
          recordingId,
        })
        .then(() => {
          this.$emit("change-tag", { trackIndex: this.index, tag });
        });
    },
    trackSelected(increment) {
      const index = Math.min(
        this.numTracks - 1,
        Math.max(0, this.index + increment)
      );

      if (0 <= index && index < this.numTracks) {
        this.$emit("track-selected", {
          trackIndex: index,
          gotoStart: true,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.card {
  &.selected-true {
    h5 {
      font-weight: 600;
    }
  }
  &.selected-false {
    h5 {
      color: $gray-700;
    }
  }
}

.card-header,
.card-body {
  padding-left: 1em;
  padding-right: 1em;
}

.card-header {
  display: flex;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
}

.track-title {
  margin-bottom: 0;
  margin-top: 0.1em;
  flex: 1 1 auto;
  line-height: unset;
  cursor: pointer;
  user-select: none;
}

.track-time {
  margin-left: auto;
  font-size: 0.7em;
  text-align: right;
}

.track-title,
.track-time {
  cursor: pointer;
}

.track-image {
  display: inline-block;
  vertical-align: text-bottom;
  width: 20px;
  height: 20px;
}

.prev-track,
.next-track {
  color: grey;
}

.delta {
  color: gray;
}

.user-tagging-hint {
  margin: 10px auto;
}

/*.ignored {
    color: gray;
  }*/

@include media-breakpoint-down(md) {
  .accordion > .card:first-of-type,
  .accordion > .card:not(:first-of-type):not(:last-of-type) {
    @include border-bottom-left-radius($border-radius);
    @include border-bottom-right-radius($border-radius);
    border-bottom: 1px solid $border-color;
  }

  .selected-false {
    display: none;
  }

  .prev-track {
    margin-left: -0.5em;
  }

  .next-track {
    margin-right: -0.5em;
  }
}

@include media-breakpoint-up(lg) {
  .prev-track,
  .next-track,
  .out-of-tracks {
    display: none;
  }

  .accordion > .card:last-of-type {
    @include border-bottom-left-radius($border-radius);
    @include border-bottom-right-radius($border-radius);
    border-bottom: 1px solid $border-color;
  }
}

// Set a height for container of the track information.
// TODO: Leave for now, figure out a better way of doing it with JS

// not ideal
$videoPlayerHeightXl: 585px;
$videoPlayerHeightLg: 495px;

@include media-breakpoint-up(lg) {
  .card {
    max-height: $videoPlayerHeightLg;
    overflow: hidden;
  }

  .card-body {
    overflow: auto;
  }
}

@include media-breakpoint-up(xl) {
  .card {
    max-height: $videoPlayerHeightXl;
  }
}
</style>
