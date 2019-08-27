<template>
  <div
    v-if="!isLoaded || isLoaded && hasTracks"
    ref="scrubber"
    :style="{
      minHeight: `${(10 * numTracks) + 10}px`
    }"
    class="track-scrubber"
  >
    <div
      v-if="!isLoaded"
      class="loading"
    >
      Loading track info...
    </div>
    <div v-else>
      <div
        v-for="(track, index) in tracks"
        :key="index"
        :title="`Track ${index + 1}`"
        :style="{
          background: colours[index % colours.length],
          top: `${index * 10}px`,
          width: getWidthForTrack(track),
          left: getOffsetForTrack(track)
        }"
        class="scrub-track"
      />
      <div
        :style="{
          right: `${canvasWidth - getOffsetForTime(currentVideoTime)}px`,
          pointerEvents: 'none',
        }"
        class="playhead"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "VideoTracksScrubber",
  props: {
    tracks: {
      type: Array,
      required: true,
    },
    colours: {
      type: Array,
      required: true,
    },
    currentVideoTime: {
      type: Number,
      default: 0,
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
      required: true,
    },
    canvasWidth: {
      type: Number,
      required: true,
    }
  },
  data() {
    return {
      inited: false,
    };
  },
  computed: {
    isLoaded() {
      const loaded = this.tracks && this.duration;
      if (loaded && this.tracks.length !== 0 && !this.inited) {
        this.init();
      }
      return loaded;
    },
    hasTracks() {
      return this.isLoaded && this.tracks.length !== 0;
    },
    numTracks() {
      return this.hasTracks ? this.tracks.length : 0;
    },
  },
  methods: {
    getWidthForTrack(track) {
      const trackDuration = track.data.end_s - track.data.start_s;
      const ratio = trackDuration / this.duration;
      return `${ratio * this.canvasWidth}px`;
    },
    getOffsetForTrack(track) {
      return `${this.getOffsetForTime(track.data.start_s)}px`;
    },
    getOffsetForTime(time) {
      const pixelsPerSecond = this.canvasWidth / this.duration;
      return pixelsPerSecond * time;
    },
    init() {
      const refs = this.$refs;
      const context = this;
      this.$nextTick(() => {
        context.inited = true;
        const scrubber = refs.scrubber;
        const passive = { passive: false };

        const touchMove = (event) => {
          event.preventDefault();
          const x = event.targetTouches[0].x - scrubber.getBoundingClientRect().x;
          const timeOffset = x / this.canvasWidth;
          context.$emit("set-playback-time", timeOffset * this.duration);
        };

        const touchEnd = (event) => {
          event.preventDefault();
          context.$emit("end-scrub");
          window.removeEventListener('touchend', touchEnd);
          window.removeEventListener('touchmove', touchMove);
        };

        scrubber.addEventListener('touchstart', (event) => {
          event.preventDefault();
          context.$emit("start-scrub");
          touchMove(event);
          window.addEventListener('touchmove', touchMove, passive);
          window.addEventListener('touchend', touchEnd, passive);
        }, passive);

        const mouseMove = (event) => {
          event.preventDefault();
          const x = event.x - scrubber.getBoundingClientRect().x;
          const timeOffset = x / this.canvasWidth;
          context.$emit("set-playback-time", timeOffset * this.duration);
        };

        const mouseEnd = (event) => {
          event.preventDefault();
          context.$emit("end-scrub");
          window.removeEventListener('mouseup', mouseEnd);
          window.removeEventListener('mousemove', mouseMove);
        };

        scrubber.addEventListener('mousedown', (event) => {
          event.preventDefault();
          context.$emit("start-scrub");
          mouseMove(event);
          window.addEventListener('mousemove', mouseMove);
          window.addEventListener('mouseup', mouseEnd);
        }, passive);
      });
    },
  }
};
</script>

<style scoped>
  .track-scrubber {
    position: relative;
    background: #2B333F;
    transition: height 0.3s;
    overflow: hidden;
  }
  .loading {
    color: #eee;
    text-align: center;
  }
  .scrub-track {
    position: absolute;
    height: 10px;
  }
  .playhead {
    height: 100%;
    position: absolute;
    background: rgba(0, 0, 0, 0.35);
    left: 0;
  }
</style>
