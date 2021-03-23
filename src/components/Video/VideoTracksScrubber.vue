<template>
  <div
    :style="{
      height: `${heightForTracks}px`,
      width: `${canvasWidth}px`,
    }"
    class="track-scrubber"
    ref="scrubber"
  >
    <div v-if="!isLoaded" class="loading">Loading track info...</div>
    <div
      v-else
      :style="{
        height: `${heightForTracks}px`,
        position: 'relative',
      }"
    >
      <div
        :style="{
          right: `${canvasWidth - playheadOffsetForCurrentTime}px`,
          pointerEvents: 'none',
          paddingLeft: `${sidePadding}px`,
        }"
        class="playhead"
      />
      <div
        v-for="(track, index) in tracks"
        :key="index"
        :title="`Track ${index + 1}`"
        :style="{
          background: colours[index % colours.length],
          top: `${6 + (index * 13)}px`,
          width: getWidthForTrack(track),
          left: getOffsetForTrack(track),
          opacity: index === currentTrack ? 1.0 : 0.5,
        }"
        class="scrub-track"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Track } from "@/api/Recording.api";
import { TagColours } from "@/const";

const getPositionXForEvent = (event: Event): number => {
  if (event instanceof TouchEvent) {
    const touch: Touch = event.targetTouches[0];
    return (touch && touch.clientX) || 0;
  } else {
    return (event as MouseEvent).x;
  }
};

export default {
  name: "VideoTracksScrubber",
  props: {
    tracks: {
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
    currentTrack: {
      type: Number,
      default: 0,
      required: true,
    },
    canvasWidth: {
      type: Number,
      required: true,
    },
    sidePadding: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      colours: TagColours,
    };
  },
  computed: {
    scrubberWidth() {
      return this.canvasWidth - this.sidePadding * 2;
    },
    isLoaded() {
      return this.tracks && this.tracks.length && this.duration;
    },
    hasTracks() {
      return this.isLoaded && this.tracks.length !== 0;
    },
    numTracks() {
      return this.hasTracks ? this.tracks.length : 0;
    },
    scrubber() {
      return this.$refs.scrubber;
    },
    offsetForCurrentTime() {
      return this.getOffsetForTime(this.currentVideoTime);
    },
    playheadOffsetForCurrentTime() {
      return this.getPlayheadOffsetForTime(this.currentVideoTime);
    },
    heightForTracks() {
      return this.numTracks === 0 ? 0 : Math.max(25, 12 + (13 * this.numTracks));
    },
  },
  methods: {
    getWidthForTrack(track: Track): string {
      const trackDuration = track.data.end_s - track.data.start_s;
      const ratio = Math.min(1, trackDuration / this.duration);
      return `${ratio * this.scrubberWidth}px`;
    },
    getOffsetForTrack(track: Track): string {
      return `${
        this.getOffsetForTime(track.data.start_s) + this.sidePadding
      }px`;
    },
    getOffsetForTime(time: number): number {
      const pixelsPerSecond = this.scrubberWidth / this.duration;
      return Math.min(this.scrubberWidth, pixelsPerSecond * time);
    },
    getPlayheadOffsetForTime(time: number): number {
      const pixelsPerSecond = this.scrubberWidth / this.duration;
      return Math.min(
        this.scrubberWidth,
        this.sidePadding + pixelsPerSecond * time
      );
    },
    pointerMove(event: Event) {
      event.preventDefault();
      const x = Math.min(
        this.scrubberWidth,
        Math.max(
          0,
          getPositionXForEvent(event) -
            this.scrubber.getBoundingClientRect().x -
            this.sidePadding
        )
      );
      const timeOffset = x / this.scrubberWidth;
      this.$emit("set-playback-time", timeOffset * this.duration);
    },
    pointerEnd(event: Event) {
      event.preventDefault();
      this.$emit("end-scrub");
      if (event instanceof MouseEvent) {
        window.removeEventListener("mouseup", this.pointerEnd);
        window.removeEventListener("mousemove", this.pointerMove);
      } else if (event instanceof TouchEvent) {
        window.removeEventListener("touchend", this.pointerEnd);
        window.removeEventListener("touchmove", this.pointerMove);
      }
    },
    pointerStart(event: Event) {
      event.preventDefault();
      this.$emit("start-scrub");
      this.pointerMove(event);
      if (event instanceof MouseEvent) {
        window.addEventListener("mousemove", this.pointerMove);
        window.addEventListener("mouseup", this.pointerEnd);
      } else if (event instanceof TouchEvent) {
        window.addEventListener("touchmove", this.pointerMove, {
          passive: false,
        });
        window.addEventListener("touchend", this.pointerEnd, {
          passive: false,
        });
      }
    },
    initScrubber() {
      if (this.scrubber) {
        this.scrubber.addEventListener("touchstart", this.pointerStart, {
          passive: false,
        });
        this.scrubber.addEventListener("mousedown", this.pointerStart, {
          passive: false,
        });
      }
    },
    tearDownScrubber() {
      if (this.scrubber) {
        this.scrubber.removeEventListener("touchstart", this.pointerStart);
        this.scrubber.removeEventListener("mousedown", this.pointerStart);
        window.removeEventListener("touchend", this.pointerEnd);
        window.removeEventListener("touchmove", this.pointerMove);
      }
    },
  },
  mounted() {
    console.log(this.canvasWidth);
    this.initScrubber();
  },
  beforeDestroy() {
    this.tearDownScrubber();
  },
};
</script>

<style scoped lang="scss">
.track-scrubber {
  //position: relative;
  background: #2b333f;
  transition: height 0.3s;
  overflow: hidden;
  /* Above the motion paths canvas if it exists */
  z-index: 810;
  margin-top: -6px;
}
.loading {
  color: #eee;
  text-align: center;
}
.scrub-track {
  transition: opacity 0.3s linear;
  height: 12px;
  border-radius: 5px;
  position: absolute;
}
.playhead {
  height: 100%;
  position: absolute;
  background: rgba(0, 0, 0, 0.35);
  left: 0;
  z-index: 1000;
  border-right: 1px solid white;
}
</style>
