<template>
  <div>
    <div class="video-container" ref="container">
      <canvas ref="canvas" :class="{ smoothed: smoothed }" />
      <canvas ref="overlayCanvas" class="overlay-canvas" />
      <span class="time">{{ elapsedTime }} / {{ totalTime }}</span>
      <span
        class="temp"
        v-if="ambientTemperature"
        v-html="ambientTemperature"
      />
      <span
        :class="['player-messaging', { show: playerMessage !== null }]"
        v-html="playerMessage"
      />
      <span v-if="showValueInfo" ref="valueTooltip" class="value-tooltip">{{
        valueUnderCursor
      }}</span>
      <div
        :class="['playback-controls', { show: buffering || atEndOfPlayback }]"
      >
        <spinner :fetching="buffering" v-if="buffering" />
        <button @click="togglePlayback" v-else-if="atEndOfPlayback">
          <font-awesome-icon
            icon="redo-alt"
            size="6x"
            rotation="270"
            v-if="atEndOfPlayback"
          />
        </button>
      </div>
    </div>
    <div class="playback-nav">
      <button @click="togglePlayback" ref="playPauseButton">
        <font-awesome-icon v-if="!playing" icon="play" />
        <font-awesome-icon v-else icon="pause" />
      </button>
      <b-tooltip
        v-if="$refs.playPauseButton"
        :target="$refs.playPauseButton"
        :title="playing ? 'Pause' : 'Play'"
        triggers="hover"
      />
      <div :class="['advanced-controls', { open: showAdvancedControls }]">
        <button
          @click="toggleAdvancedControls"
          class="advanced-controls-btn"
          ref="advancedControlsButton"
        >
          <font-awesome-icon
            :icon="showAdvancedControls ? 'angle-right' : 'ellipsis-v'"
          />
        </button>
        <b-tooltip
          v-if="$refs.advancedControlsButton"
          :target="$refs.advancedControlsButton"
          :title="showAdvancedControls ? 'Show less' : 'Show more'"
          triggers="hover"
        />
        <button @click="toggleSmoothing" ref="toggleSmoothingButton">
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 512 512"
            width="18"
          >
            <path
              fill="currentColor"
              d="M149.333 56v80c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V56c0-13.255 10.745-24 24-24h101.333c13.255 0 24 10.745 24 24zm181.334 240v-80c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.256 0 24.001-10.745 24.001-24zm32-240v80c0 13.255 10.745 24 24 24H488c13.255 0 24-10.745 24-24V56c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24zm-32 80V56c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.256 0 24.001-10.745 24.001-24zm-205.334 56H24c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24zM0 376v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H24c-13.255 0-24 10.745-24 24zm386.667-56H488c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24zm0 160H488c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24zM181.333 376v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24z"
              class=""
            ></path>
          </svg>
        </button>
        <b-tooltip
          v-if="$refs.toggleSmoothingButton"
          :target="$refs.toggleSmoothingButton"
          :title="smoothed ? 'Disable smoothing' : 'Enable smoothing'"
          triggers="hover"
        />

        <button @click="toggleHistogram" ref="toggleHistogramButton">
          <font-awesome-icon icon="chart-bar" />
        </button>
        <b-tooltip
          v-if="$refs.toggleHistogramButton"
          :target="$refs.toggleHistogramButton"
          :title="showingHistogram ? 'Hide histogram' : 'Show histogram'"
          triggers="hover"
        />

        <button
          @click="togglePicker"
          :class="{ selected: showValueInfo }"
          ref="toggleValuePicker"
        >
          <font-awesome-icon icon="eye-dropper" />
        </button>
        <b-tooltip
          v-if="$refs.toggleValuePicker"
          :target="$refs.toggleValuePicker"
          :title="
            showValueInfo
              ? 'Disable picker'
              : 'Show raw pixel values under cursor'
          "
          triggers="hover"
        />
        <button
          v-if="hasBackgroundFrame"
          ref="showBackgroundFrame"
          @mousedown="toggleBackground"
          @mouseup="toggleBackground"
        >
          <font-awesome-icon icon="image" />
        </button>
        <b-tooltip
          v-if="hasBackgroundFrame && $refs.showBackgroundFrame"
          :target="$refs.showBackgroundFrame"
          title="Press to show background frame"
          triggers="hover"
        />
        <button @click="incrementPalette" ref="cyclePalette">
          <font-awesome-icon icon="palette" />
        </button>
        <b-tooltip
          v-if="$refs.cyclePalette"
          :target="$refs.cyclePalette"
          title="Cycle colour map"
          triggers="hover"
        />
        <button @click="stepBackward" ref="stepBackward">
          <font-awesome-icon icon="backward" />
        </button>
        <b-tooltip
          v-if="$refs.stepBackward"
          :target="$refs.stepBackward"
          title="Go back one frame"
          triggers="hover"
        />
        <button @click="stepForward" ref="stepForward">
          <font-awesome-icon icon="forward" />
        </button>
        <b-tooltip
          v-if="$refs.stepForward"
          :target="$refs.stepForward"
          title="Go forward one frame"
          triggers="hover"
        />
        <button @click="exportMp4" ref="exportMp4">
          <font-awesome-icon :icon="['far', 'file-video']" />
        </button>
        <b-tooltip
          v-if="$refs.exportMp4"
          :target="$refs.exportMp4"
          title="Export MP4 of recording"
          triggers="hover"
        />
        <button>
          <font-awesome-icon :icon="['far', 'file']" />
        </button>
        <button @click="incrementSpeed" ref="cyclePlaybackSpeed">
          <font-awesome-icon icon="tachometer-alt" />
        </button>
        <b-tooltip
          v-if="$refs.cyclePlaybackSpeed"
          :target="$refs.cyclePlaybackSpeed"
          title="Cycle playback speed"
          triggers="hover"
        />
        <button
          @click="showHeaderInfo"
          :class="{ selected: displayHeaderInfo }"
          ref="showHeader"
        >
          <font-awesome-icon icon="info-circle" />
        </button>
        <b-tooltip
          v-if="$refs.showHeader"
          :target="$refs.showHeader"
          title="Show recording header info"
          triggers="hover"
        />
      </div>
    </div>
    <VideoTracksScrubber
      :class="{ 'ended-playback': ended }"
      ref="scrubber"
      :duration="actualDuration"
      :tracks="tracks"
      :current-video-time="currentTime60fps"
      :time-adjustment-for-background-frame="timeAdjustmentForBackgroundFrame"
      :current-track="currentTrack.trackIndex"
      :canvas-width="canvasWidth"
      :side-padding="1"
      @start-scrub="startScrub"
      @end-scrub="endScrub"
      @set-playback-time="setTimeAndRedraw"
    />
    <b-modal v-model="displayHeaderInfo" title="Recording metadata" hide-footer>
      <pre v-if="header">{{ headerInfo }}</pre>
    </b-modal>
    <b-modal
      v-model="isExporting"
      title="Exporting video"
      no-close-on-backdrop
      no-close-on-esc
      hide-footer
      hide-header-close
      centered
    >
      <b-progress :value="exportProgress * 100" max="100" />
      <div class="progress-text">{{ Math.round(exportProgress * 100) }}%</div>
    </b-modal>
    <b-modal v-model="hasStreamLoadError">{{ streamLoadError }}</b-modal>
  </div>
</template>

<script lang="ts">
import VideoTracksScrubber from "./VideoTracksScrubber.vue";
import {
  CptvFrame,
  CptvFrameHeader,
  CptvHeader,
  CptvPlayer,
} from "cptv-player";
import { TagColours } from "@/const";

// @ts-ignore
import viridis from "scale-color-perceptual/rgb/viridis.json";
// @ts-ignore
import plasma from "scale-color-perceptual/rgb/plasma.json";
// @ts-ignore
import magma from "scale-color-perceptual/rgb/magma.json";
// @ts-ignore
import inferno from "scale-color-perceptual/rgb/inferno.json";
import Spinner from "@/components/Spinner.vue";

const mapRgba = ([r, g, b]) =>
  (255 << 24) | ((b * 255.0) << 16) | ((g * 255.0) << 8) | (r * 255.0);

const Viridis = Object.freeze(viridis.map(mapRgba));
const Plasma = Object.freeze(plasma.map(mapRgba));
const Inferno = Object.freeze(inferno.map(mapRgba));
const Magma = Object.freeze(magma.map(mapRgba));
const greysSq = [];
const greys = [];
const inc = 1 / 255;
for (let i = 0; i <= 1; i += inc) {
  greysSq.push(mapRgba([i * i, i * i, i * i]));
  greys.push(mapRgba([i, i, i]));
}
const Greyscale = Object.freeze(greys);
const GreyscaleSquared = Object.freeze(greysSq);
const ColourMaps = [
  ["Viridis", Viridis],
  ["Plasma", Plasma],
  ["Inferno", Inferno],
  ["Magma", Magma],
  ["Greyscale", Greyscale],
  ["Grayscale<sup>2</sup>", GreyscaleSquared],
];
const PlaybackSpeeds = [0.5, 1, 2, 4, 6];

const download = (url, filename) => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename || "download";
  anchor.click();
};

const yieldToUI = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

const getAuthoritativeTagForTrack = (trackTags) => {
  const userTags = trackTags.filter((tag) => tag.user !== null);
  if (userTags.length) {
    return userTags[0].what;
  } else {
    const tag = trackTags.find(
      (tag) => (tag.data && tag.data === "Master") || tag.data.name === "Master"
    );
    if (tag) {
      return tag;
    }
  }
  return null;
};

const player: CptvPlayer = new CptvPlayer();
let frameBuffer: Uint8ClampedArray;

interface TrackBox {
  what: string;
  rect: [number, number, number, number];
}

export default {
  name: "CptvPlayer",
  components: {
    Spinner,
    VideoTracksScrubber,
  },
  props: {
    cptvUrl: {
      type: String,
      required: true,
    },
    cptvSize: {
      type: Number,
      required: true,
    },
    tracks: {
      type: Array,
      required: true,
    },
    currentTrack: {
      type: Object,
    },
    recording: {
      type: Object,
      required: true,
    },
    showOverlaysForCurrentTrackOnly: {
      type: Boolean,
      default: false,
    },
    recentlyAddedTag: {
      type: Object,
      default: null,
    },
  },
  data(): {
    header: CptvHeader;
    frameHeader: CptvFrameHeader;
  } {
    return {
      colours: TagColours,
      canvasWidth: 800,
      canvasHeight: 600,
      isScrubbing: false,
      ended: false,
      header: null,
      frameHeader: null,
      smoothed: true,
      showValueInfo: false,
      isShowingBackgroundFrame: false,
      frameNum: 0,
      animationTick: 0,
      speedMultiplierIndex: 1,
      paletteIndex: 0,
      animationFrame: null,
      playing: false,
      wasPaused: true,
      totalFrames: false,
      colourMap: Viridis,
      showAdvancedControls: false,
      displayHeaderInfo: false,
      loadProgress: 0,
      playerMessage: null,
      messageTimeout: null,
      valueUnderCursor: null,
      buffering: false,
      isExporting: false,
      exportProgress: 0,
      showingHistogram: false,
      globalClampedMin: undefined,
      loadedStream: false,
      streamLoadError: null,
    };
  },
  computed: {
    hasStreamLoadError: {
      get() {
        return this.streamLoadError !== null;
      },
      set(val) {
        if (!val) {
          this.streamLoadError = null;
        }
      },
    },
    processedTracks(): Record<number, Record<number, TrackBox>> {
      const timeOffset = this.timeAdjustmentForBackgroundFrame;

      // Map track box position times to actual frames, easier to use than time offsets.
      const frameAtTime = (time) => {
        return Math.round(time / this.frameTimeSeconds);
      };

      // Add a bit of breathing room around our boxes
      const padding = 5;
      return this.tracks
        .map(({ data, trackIndex, TrackTags }) => ({
          what: getAuthoritativeTagForTrack(TrackTags),
          start_s: Math.max(0, data.start_s - timeOffset),
          end_s: data.end_s - timeOffset,
          num_frames: data.num_frames + (this.hasBackgroundFrame ? -1 : 0),
          trackIndex,
          positions: data.positions.map(
            ([time, [left, top, right, bottom]]) => [
              frameAtTime(time - timeOffset),
              time - timeOffset,
              [
                Math.max(0, left - padding),
                Math.max(0, top - padding),
                right + padding,
                bottom + padding,
              ],
            ]
          ),
        }))
        .reduce((acc, item, index) => {
          for (const position of item.positions) {
            acc[position[0]] = acc[position[0]] || {};
            const frame = acc[position[0]];
            frame[index] = {
              rect: position[2],
              what: item.what,
            };
          }
          return acc;
        }, {});
    },
    actualDuration() {
      if (this.totalFrames) {
        return this.adjustedTotalFrames / this.header.fps;
      }
      return Math.max(
        ...this.tracks.map(
          (track) => track.data.end_s - this.timeAdjustmentForBackgroundFrame
        ),
        this.duration - this.timeAdjustmentForBackgroundFrame
      );
    },
    adjustedTotalFrames() {
      if (this.totalFrames) {
        return this.hasBackgroundFrame
          ? this.totalFrames - 1
          : this.totalFrames;
      } else {
        return this.header.fps * this.actualDuration;
      }
    },
    timeAdjustmentForBackgroundFrame() {
      if (this.hasBackgroundFrame) {
        return this.frameTimeSeconds;
      }
      return 0;
    },
    hasBackgroundFrame() {
      return this.header && this.header.hasBackgroundFrame;
    },
    duration() {
      return (this.recording && this.recording.duration) || 0;
    },
    currentTime60fps() {
      if (this.header) {
        const holdForXFrames = Math.ceil(
          60 / (this.header.fps * this.speedMultiplier)
        );
        const tick = Math.max(0, this.animationTick - 1);
        const adjustment =
          (tick % holdForXFrames) * (1 / holdForXFrames / holdForXFrames);
        return this.currentTime + adjustment;
      }
      return 0;
    },
    frameTimeSeconds(): number {
      if (this.header) {
        return 1 / this.header.fps;
      }
      return 1 / 9;
    },
    elapsedTime(): string {
      return this.formatTime(this.currentTime);
    },
    totalTime(): string {
      return this.formatTime(this.actualDuration);
    },
    currentTime() {
      if (this.header) {
        const totalTime = this.actualDuration;
        // TODO check whether the backend uses 8.7 or 9 as the fps when calculating duration. (seems to be 9)
        // Does the backend take the background_frame into account when setting duration?  Seems to.
        const totalFramesEstimate = totalTime * this.header.fps;
        return (this.frameNum / totalFramesEstimate) * totalTime;
      }
      return 0;
    },
    ambientTemperature() {
      if (this.frameHeader && this.frameHeader.frameTempC) {
        return `Around ${Math.round(this.frameHeader.frameTempC)}&deg;C`;
      }
      return false;
    },
    secondsSinceLastFFC() {
      if (this.frameHeader && this.frameHeader.lastFfcTimeMs) {
        return (
          (this.frameHeader.timeOnMs - this.frameHeader.lastFfcTimeMs) / 1000
        );
      }
      return 1000;
    },
    atEndOfPlayback(): boolean {
      return (
        this.header &&
        this.adjustedTotalFrames &&
        this.frameNum === this.adjustedTotalFrames
      );
    },
    speedMultiplier() {
      return PlaybackSpeeds[this.speedMultiplierIndex];
    },
    headerInfo() {
      const h = this.header;
      if (h) {
        return JSON.stringify(
          {
            dimensions: `${h.width} x ${h.height}`,
            fps: h.fps,
            time: new Date(h.timestamp / 1000).toLocaleString(),
            "device name": h.deviceName || "Unknown",
            "device ID": h.deviceId || "Unknown",
            "has background": h.hasBackgroundFrame,
            "preview seconds": h.previewSecs,
            sensor: `${h.brand || "Unknown brand"} ${
              h.model || "Unknown model"
            }`,
            serial: (h.serialNumber && `#${h.serialNumber}`) || "Unknown",
            firmware: `${h.firmwareVersion || "Unknown"}`,
            "motion config":
              (h.motionConfig &&
                h.motionConfig.split("\n").reduce((acc, item) => {
                  const parts = item.split(": ");
                  if (Number(parts[1]) == parts[1]) {
                    acc[parts[0]] = Number(parts[1]);
                  } else {
                    acc[parts[0]] = parts[1];
                  }
                  return acc;
                }, {})) ||
              "None",
          },
          null,
          "  "
        );
      } else {
        return null;
      }
    },
  },
  created() {
    // Restore user preferences
    const smoothingPreference = window.localStorage.getItem("video-smoothing");
    if (smoothingPreference) {
      this.smoothed = smoothingPreference === "true";
    }
    const palettePreference = window.localStorage.getItem("video-palette");
    if (palettePreference) {
      this.paletteIndex = ColourMaps.findIndex(
        ([name]) => name === palettePreference
      );
      this.colourMap = ColourMaps[this.paletteIndex][1];
    }
    const playbackSpeed = window.localStorage.getItem("video-playback-speed");
    if (playbackSpeed) {
      this.speedMultiplierIndex = PlaybackSpeeds.findIndex(
        (mul) => mul === Number(playbackSpeed)
      );
    }
  },
  async mounted() {
    window.addEventListener("resize", this.onResize);
    window
      .matchMedia("screen and (min-resolution: 2dppx)")
      .addEventListener("change", this.setCanvasDimensions);

    this.setCanvasDimensions();
    const canvas = this.$refs.overlayCanvas;
    canvas.addEventListener("click", this.clickOverlayCanvas);
    canvas.addEventListener("mousemove", this.moveOverOverlayCanvas);
    this.loadedStream = await player.initWithCptvUrlAndSize(
      this.cptvUrl,
      this.cptvSize
    );
    if (this.loadedStream === "Failed to verify JWT.") {
      window.location.reload();
    } else if (this.loadedStream == true) {
      this.header = await player.getHeader();

      // Let the parent know about the header, so it can inform the Track info panels
      // about any time display offsets caused by having a background frame.
      this.$emit("received-header", this.header);
      frameBuffer = new Uint8ClampedArray(
        this.header.width * this.header.height * 4
      );
      this.$refs.canvas.width = this.header.width;
      this.$refs.canvas.height = this.header.height;
      this.clearCanvas();
      await this.fetchRenderAdvanceFrame();
      if (this.hasBackgroundFrame) {
        let background = player.getBackgroundFrame();
        while (background === null) {
          await this.fetchRenderAdvanceFrame();
          background = player.getBackgroundFrame();
        }
        const { data, min, max } = background;
        const range = max - min;
        // Create histogram of background frame, and clamp out any outlier low values (sky etc)
        // Bin into maybe 16 bins?
        const numBins = 32;
        const hist = new Array(numBins).fill(0);
        for (let i = 0; i < numBins; i++) {
          hist[i] = [0, min + (range / numBins) * (i + 1)];
        }

        //  Create a histogram component, and allow us to clamp the cold point
        //  Try and be "smart" about selecting cold point when there is i.e. sky
        for (let i = 0; i < data.length; i++) {
          const val = data[i];
          const bin = Math.floor((numBins * (val - min)) / range);
          hist[bin][0]++;
        }
        //console.log(hist);
        const total = this.header.width * this.header.height;
        const threshold = total / 30;
        let px = 0;
        let binIndex = -1;
        while (px < threshold) {
          binIndex++;
          px += hist[binIndex][0];
        }
        //this.globalClampedMin = hist[binIndex][1];
        //console.log(this.globalClampedMin);
      }
      await this.fetchRenderAdvanceFrame();
    } else {
      this.streamLoadError = this.loadedStream;
    }
  },
  beforeDestroy() {
    const canvas = this.$refs.overlayCanvas;
    canvas.removeEventListener("click", this.clickOverlayCanvas);
    canvas.removeEventListener("mousemove", this.moveOverOverlayCanvas);
    window.removeEventListener("resize", this.onResize);
    window
      .matchMedia("screen and (min-resolution: 2dppx)")
      .removeEventListener("change", this.setCanvasDimensions);
  },
  watch: {
    currentTrack() {
      this.selectTrack();
    },
    recentlyAddedTag() {
      this.renderOverlay(
        this.$refs.overlayCanvas.getContext("2d"),
        this.scale,
        this.secondsSinceLastFFC,
        false,
        this.frameNum
      );
      // Redraw, and flash the box if it's showing on screen.
    },
    async cptvUrl(url) {
      this.loadedStream = false;
      this.clearCanvas();
      this.loadedStream = await player.initWithCptvUrlAndSize(
        url,
        this.cptvSize
      );
      if (this.loadedStream === "Failed to verify JWT.") {
        window.location.reload();
      } else if (this.loadedStream === true) {
        this.header = await player.getHeader();
        frameBuffer = new Uint8ClampedArray(
          this.header.width * this.header.height * 4
        );
        this.$refs.canvas.width = this.header.width;
        this.$refs.canvas.height = this.header.height;
        this.frameNum = 0;
        this.animationTick = 0;
        this.totalFrames = false;
        cancelAnimationFrame(this.animationFrame);
        this.playing = false;
        this.wasPaused = true;
        await this.fetchRenderAdvanceFrame();
      } else {
        this.streamLoadError = this.loadedStream;
      }
    },
  },
  methods: {
    selectTrack() {
      if (this.currentTrack.start_s) {
        if (
          this.processedTracks &&
          this.currentTrack.trackIndex <
            Object.keys(this.processedTracks).length
        ) {
          cancelAnimationFrame(this.animationFrame);
          this.setTimeAndRedraw(this.currentTrack.start_s + 0.01);
        }
      }
    },
    toggleHistogram() {
      this.showingHistogram = !this.showingHistogram;
    },
    formatTime(time: number): string {
      let seconds = Math.floor(time);
      if (seconds < 60) {
        return `0.${`${seconds}`.padStart(2, "0")}`;
      }
      const minutes = Math.floor(seconds / 60);
      seconds = seconds - minutes * 60;
      return `${minutes}.${seconds.toString().padStart(2, "0")}`;
    },
    async ensureEntireClipIsDecoded() {
      let frameNum = 0;
      while (!this.totalFrames) {
        await this.queueFrame(frameNum++);
      }
      if (this.totalFrames) {
        console.log(
          "Entire clip decoded and ready for export",
          this.totalFrames,
          this.adjustedTotalFrames
        );
      }
      return true;
    },
    async stepForward() {
      this.pause();
      const canAdvance = await this.renderCurrentFrame(true, this.frameNum + 1);
      if (canAdvance) {
        this.frameNum++;
      }
    },
    async stepBackward() {
      this.pause();
      await this.renderCurrentFrame(true, this.frameNum - 1);
      this.frameNum = Math.max(0, this.frameNum - 1);
    },
    async clickOverlayCanvas(event) {
      const canvas = this.$refs.overlayCanvas;
      const canvasOffset = canvas.getBoundingClientRect();
      const x = event.x - canvasOffset.x;
      const y = event.y - canvasOffset.y;
      const hitTrackIndex = this.getTrackIndexAtPosition(x, y);
      canvas.style.cursor = hitTrackIndex !== null ? "pointer" : "default";
      if (hitTrackIndex !== null) {
        await this.renderCurrentFrame();
        this.$emit("track-selected", {
          trackIndex: hitTrackIndex,
        });
      }
    },
    clearCanvas() {
      const canvas = this.$refs.canvas as HTMLCanvasElement;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
    },
    moveOverOverlayCanvas(event) {
      const canvas = this.$refs.overlayCanvas;
      const canvasOffset = canvas.getBoundingClientRect();
      const x = event.x - canvasOffset.x;
      const y = event.y - canvasOffset.y;
      const hitTrackIndex = this.getTrackIndexAtPosition(x, y);
      // set cursor
      canvas.style.cursor = hitTrackIndex !== null ? "pointer" : "default";
      if (this.showValueInfo) {
        canvas.style.cursor = "default";
        // Map the x,y into canvas size
        const pX = Math.round(x / this.scale);
        const pY = Math.round(y / this.scale);
        const frameData = player.getFrameAtIndex(this.frameNum - 1);
        this.valueUnderCursor = frameData.data[pY * this.header.width + pX];
        this.$refs.valueTooltip.style.left = `${x + 2}px`;
        this.$refs.valueTooltip.style.top = `${y - 20}px`;
      }
    },
    async fetchRenderAdvanceFrame() {
      // Fetch, render, advance
      const canAdvance = await this.renderCurrentFrame();
      if (canAdvance) {
        return true;
      } else if (this.playing) {
        this.pause();
      }
    },
    toggleAdvancedControls() {
      this.showAdvancedControls = !this.showAdvancedControls;
    },
    async exportMp4() {
      this.pause();
      // TODO(jon): Better to do this in a web-worker so that we don't block the main thread.
      // Also warn users not to navigate away from the page while it's encoding.
      this.isExporting = true;
      this.exportProgress = 0;
      // @ts-ignore
      const HME = await import("h264-mp4-encoder");
      const encoder = await HME.createH264MP4Encoder();
      await yieldToUI();
      const renderCanvas = document.createElement("canvas");
      const targetWidth = 640;
      const targetHeight = 480;

      // Must be a multiple of 2.
      encoder.width = targetWidth;
      encoder.height = targetHeight;
      encoder.frameRate = this.header.fps;
      encoder.quantizationParameter = 10;
      //encoder.speed = 10;
      encoder.speed = 0;
      encoder.groupOfPictures = 1;
      //encoder.debug = true;

      renderCanvas.width = targetWidth;
      renderCanvas.height = targetHeight;
      const context = renderCanvas.getContext("2d");
      const videoCanvas = document.createElement("canvas");
      videoCanvas.width = this.header.width;
      videoCanvas.height = this.header.height;
      const videoContext = videoCanvas.getContext("2d");

      // Make sure everything is loaded to ensure that we have final min/max numbers for normalisation

      // TODO(jon): Incorporate this time into the progress bar if the video hasn't already downloaded/decoded
      //  Either that, or we interleave the decoding with the encoding process
      await this.ensureEntireClipIsDecoded();
      encoder.initialize();
      let frameNum = 0;

      await yieldToUI();
      console.assert(this.totalFrames !== false);
      while (frameNum < this.adjustedTotalFrames) {
        const { frameData } = await this.queueFrame(frameNum);
        const frameHeader = player.getFrameHeaderAtIndex(frameNum);
        const imgData = this.getCurrentFrameData(
          videoContext,
          frameData,
          frameHeader
        );
        videoContext.putImageData(imgData, 0, 0);
        context.imageSmoothingEnabled = this.smoothed;
        if (this.smoothed) {
          context.imageSmoothingQuality = "high";
        }
        context.drawImage(
          videoCanvas,
          0,
          0,
          videoCanvas.width,
          videoCanvas.height,
          0,
          0,
          renderCanvas.width,
          renderCanvas.height
        );

        // Draw the overlay
        let timeSinceLastFFCSeconds = Number.MAX_SAFE_INTEGER;
        if (frameHeader.lastFfcTimeMs) {
          timeSinceLastFFCSeconds =
            (frameHeader.timeOnMs - frameHeader.lastFfcTimeMs) / 1000;
        }
        this.renderOverlay(
          context,
          renderCanvas.width / videoCanvas.width,
          timeSinceLastFFCSeconds,
          true,
          frameNum
        );

        encoder.addFrameRgba(
          context.getImageData(0, 0, encoder.width, encoder.height).data
        );
        this.exportProgress = frameNum / this.adjustedTotalFrames;
        await yieldToUI();
        frameNum++;
      }
      encoder.finalize();
      const uint8Array = encoder.FS.readFile(encoder.outputFilename);
      download(
        URL.createObjectURL(new Blob([uint8Array], { type: "video/mp4" })),
        `recording_${this.recording.id}__${new Date(
          this.header.timestamp / 1000
        ).toLocaleString()}`
      );
      encoder.delete();
      this.isExporting = false;
    },
    getCurrentFrameData(
      context: CanvasRenderingContext2D,
      frame: CptvFrame,
      frameHeader: CptvFrameHeader
    ) {
      const { min, max, data: frameData } = frame;
      const imgData = new ImageData(
        frameBuffer,
        this.header.width,
        this.header.height
      );
      const data = new Uint32Array(imgData.data.buffer);
      const colourMap = this.colourMap;
      const timeSinceLastFFC =
        (frameHeader.timeOnMs - frameHeader.lastFfcTimeMs) / 1000;
      const range = max - min;
      if (timeSinceLastFFC < 5) {
        // We want to remap into the known sane range of values
        const {
          imageData: { min: localMin, max: localMax },
        } = frameHeader;
        const localRange = localMax - localMin;
        for (let i = 0; i < data.length; i++) {
          const index = ((frameData[i] - localMin) / localRange) * 255.0;
          const indexUpper = Math.ceil(index);
          data[i] = colourMap[indexUpper];
        }
      } else if (this.globalClampedMin !== undefined) {
        const thisMin = Math.max(min, this.globalClampedMin);
        console.log("Clamped min", thisMin);
        const range = max - thisMin;
        for (let i = 0; i < data.length; i++) {
          const index =
            ((Math.max(frameData[i], thisMin) - thisMin) / range) * 255.0;
          const indexUpper = Math.ceil(index);
          //const indexLower = Math.floor(index);
          // TODO(jon): Interpolate between these steps?
          data[i] = colourMap[indexUpper];
        }
      } else {
        for (let i = 0; i < data.length; i++) {
          const index = ((frameData[i] - min) / range) * 255.0;
          const indexUpper = Math.ceil(index);
          //const indexLower = Math.floor(index);
          // TODO(jon): Interpolate between these steps?
          data[i] = colourMap[indexUpper];
        }
      }
      return imgData;
    },
    renderFrame(frameData, frameNum: number | false, force: boolean = false) {
      const context = this.$refs.canvas.getContext("2d");
      if (frameNum !== false) {
        this.frameHeader = player.getFrameHeaderAtIndex(frameNum);
      }
      const imgData = this.getCurrentFrameData(
        context,
        frameData,
        this.frameHeader
      );
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = requestAnimationFrame(() => {
        this.drawFrame(context, imgData, frameNum || this.frameNum, force);
      });
    },
    async queueFrame(frameNum: number) {
      let frameData = player.getFrameAtIndex(frameNum);
      if (frameData) {
        return { frameNum, frameData };
      } else {
        await yieldToUI();
        await player.seekToFrame(frameNum);
      }
      frameData = player.getFrameAtIndex(frameNum);
      if (frameData === null) {
        console.assert(player.getTotalFrames() !== null);
        this.totalFrames = player.getTotalFrames();
        frameNum = this.adjustedTotalFrames - 1;
        frameData = player.getFrameAtIndex(frameNum);
        console.assert(frameData !== null);
      }
      return { frameNum, frameData };
    },
    async drawFrame(context, imgData, frameNum, force = false) {
      if (context) {
        // One tick represents 1000 / fps * multiplier
        if (this.playing) {
          this.animationTick++;
        }
        const everyXTicks = Math.max(
          1,
          Math.floor(60 / (this.header.fps * this.speedMultiplier))
        );
        //console.log(everyXTicks);
        // NOTE: respect fps here, render only when we should.
        const shouldRedraw = this.animationTick % everyXTicks === 0;

        //console.log("Should redraw", this.animationTick, everyXTicks, this.animationTick % everyXTicks, shouldRedraw);
        if (context && (shouldRedraw || force)) {
          context.putImageData(imgData, 0, 0);
          this.renderOverlay(
            this.$refs.overlayCanvas.getContext("2d"),
            this.scale,
            this.secondsSinceLastFFC,
            false,
            frameNum
          );
          let didAdvance = false;
          if (this.playing) {
            didAdvance = await this.fetchRenderAdvanceFrame();
          }
          if (didAdvance) {
            this.animationTick = 0;
            this.frameNum++;
          }
        } else {
          cancelAnimationFrame(this.animationFrame);
          this.animationFrame = requestAnimationFrame(() =>
            this.drawFrame(context, imgData, frameNum)
          );
        }
      }
    },
    incrementSpeed() {
      this.speedMultiplierIndex++;
      if (this.speedMultiplierIndex === PlaybackSpeeds.length) {
        this.speedMultiplierIndex = 0;
      }
      this.setPlayerMessage(
        `Speed ${PlaybackSpeeds[this.speedMultiplierIndex]}x`
      );
      window.localStorage.setItem(
        "video-playback-speed",
        PlaybackSpeeds[this.speedMultiplierIndex].toString()
      );
    },
    async incrementPalette() {
      this.paletteIndex++;
      if (this.paletteIndex === ColourMaps.length) {
        this.paletteIndex = 0;
      }
      const paletteName = ColourMaps[this.paletteIndex][0];
      this.setPlayerMessage(paletteName);
      window.localStorage.setItem("video-palette", paletteName);
      this.colourMap = ColourMaps[this.paletteIndex][1];
      await this.renderCurrentFrame();
    },
    showHeaderInfo() {
      this.displayHeaderInfo = true;
    },
    setPlayerMessage(message: string) {
      clearTimeout(this.messageTimeout);
      if (this.messageTimeout !== null || this.playerMessage !== null) {
        this.messageTimeout = null;
        this.playerMessage = null;
        cancelAnimationFrame(this.raf);
        this.raf = requestAnimationFrame(() => {
          this.setPlayerMessage(message);
        });
      } else {
        this.playerMessage = message;
        this.messageTimeout = setTimeout(() => {
          this.messageTimeout = null;
          this.playerMessage = null;
        }, 1000);
      }
    },
    renderOverlay(
      context: CanvasRenderingContext2D,
      scale: number,
      timeSinceFFCSeconds: number,
      isExporting: boolean,
      frameNum: number
    ) {
      if (!isExporting) {
        // Clear if we are drawing on the live overlay, but not if we're drawing for export
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      }
      const tracks =
        this.processedTracks[frameNum] || ({} as Record<number, TrackBox>);
      for (const [trackIndex, trackBox] of Object.entries(tracks)) {
        if (this.currentTrack.trackIndex !== Number(trackIndex)) {
          const box = trackBox as TrackBox;
          this.drawRectWithText(
            context,
            Number(trackIndex),
            box.rect,
            box.what,
            isExporting
          );
        }
      }
      // Always draw selected track last, so it sits on top of any overlapping tracks.
      for (const [trackIndex, trackBox] of Object.entries(tracks)) {
        if (this.currentTrack.trackIndex === Number(trackIndex)) {
          const box = trackBox as TrackBox;
          this.drawRectWithText(
            context,
            Number(trackIndex),
            box.rect,
            box.what,
            isExporting
          );
        }
      }
      if (timeSinceFFCSeconds < 10) {
        context.font = "bold 15px Verdana";

        // NOTE: Make opacity of text stronger when the FFC event has just happened, then fade out
        let a = 1 / (10 - timeSinceFFCSeconds);
        a = a * a;
        const alpha = 1 - a;
        context.fillStyle = `rgba(163, 210, 226, ${alpha})`;

        const text = "Calibrating...";
        const textWidth = context.measureText(text).width;
        const deviceRatio = isExporting ? 1 : window.devicePixelRatio;
        const textX = context.canvas.width / deviceRatio / 2 - textWidth / 2;
        const textY = 20;
        context.fillText(text, textX, textY);
      }
    },
    drawRectWithText(
      context: CanvasRenderingContext2D,
      trackIndex: number,
      dims: [number, number, number, number],
      what: string,
      isExporting: boolean
    ) {
      const selected =
        this.currentTrack.trackIndex === trackIndex || isExporting;
      const lineWidth = selected ? 2 : 1;
      const outlineWidth = lineWidth + 4;
      const halfOutlineWidth = outlineWidth / 2;
      const deviceRatio = isExporting ? 1 : window.devicePixelRatio;
      const scale = context.canvas.width / this.header.width;
      const [left, top, right, bottom] = dims.map((x) => x * scale);
      const rectWidth = right - left;
      const rectHeight = bottom - top;

      const x =
        Math.max(halfOutlineWidth, Math.round(left) - halfOutlineWidth) /
        deviceRatio;
      const y =
        Math.max(halfOutlineWidth, Math.round(top) - halfOutlineWidth) /
        deviceRatio;
      const width =
        Math.round(
          Math.min(context.canvas.width - left, Math.round(rectWidth))
        ) / deviceRatio;
      const height =
        Math.round(
          Math.min(context.canvas.height - top, Math.round(rectHeight))
        ) / deviceRatio;
      context.lineJoin = "round";
      context.lineWidth = outlineWidth;
      context.strokeStyle = `rgba(0, 0, 0, ${selected ? 0.4 : 0.5})`;
      context.beginPath();
      context.strokeRect(x, y, width, height);
      context.strokeStyle = this.colours[trackIndex % this.colours.length];
      context.lineWidth = lineWidth;
      context.beginPath();
      context.strokeRect(x, y, width, height);
      if (selected || isExporting) {
        // If exporting, show all the best guess animal tags, if not unknown
        // If there's only one track, don't annotate with "Track X (..)"
        const text =
          isExporting || this.tracks.length === 1
            ? what
            : `Track ${trackIndex + 1}${what ? `(${what})` : ""}`;
        if (text !== "") {
          const textHeight = 14;
          const textWidth = context.measureText(text).width;

          let textX = x + (width - textWidth);
          let textY = y + (height + textHeight);
          // Make sure the text doesn't get clipped off if the box is near the frame edges
          if (textY + textHeight > context.canvas.height / deviceRatio) {
            textY = top - 5 * deviceRatio;
          }
          if (textX < 0) {
            textX = left + 10 * deviceRatio;
          }
          context.font = "12px Verdana";
          context.lineWidth = 4;
          context.strokeStyle = "rgba(0, 0, 0, 0.5)";
          context.strokeText(text, textX, textY);
          context.fillStyle = "white";
          context.fillText(text, textX, textY);
        }
      }
    },
    toggleSmoothing() {
      this.smoothed = !this.smoothed;
      window.localStorage.setItem("video-smoothing", String(this.smoothed));
      this.setPlayerMessage(
        `Smoothing ${this.smoothed ? "Enabled" : "Disabled"}`
      );
    },
    togglePicker() {
      // When we move the cursor over the image, should show raw and estimated temp values of pixel under cursor.
      this.showValueInfo = !this.showValueInfo;
    },
    async toggleBackground() {
      this.wasPaused = !this.playing;
      if (!this.isShowingBackgroundFrame) {
        const background = player.getBackgroundFrame();
        if (background.data.length !== 0) {
          if (this.playing) {
            this.pause();
            this.wasPaused = true;
          }
          const context = this.$refs.canvas.getContext("2d");
          const imgData = this.getCurrentFrameData(
            context,
            background,
            this.frameHeader
          );
          context.putImageData(imgData, 0, 0);
          // Clear overlay
          const overlayContext = this.$refs.overlayCanvas.getContext("2d");
          overlayContext.clearRect(
            0,
            0,
            overlayContext.canvas.width,
            overlayContext.canvas.height
          );
        }
      } else {
        if (!this.wasPaused) {
          this.wasPaused = false;
          await this.play();
        } else {
          await this.renderCurrentFrame(true);
        }
      }
      this.isShowingBackgroundFrame = !this.isShowingBackgroundFrame;
    },
    getTrackIndexAtPosition(x: number, y: number): number | null {
      const tracks =
        this.processedTracks[this.frameNum] || ({} as Record<number, TrackBox>);
      for (const [trackIndex, trackBox] of Object.entries(tracks)) {
        const box = trackBox as TrackBox;
        const [left, top, right, bottom] = box.rect.map((x) => x * this.scale);
        if (left <= x && right > x && top <= y && bottom > y) {
          // If the track is already selected, ignore it
          if (Number(trackIndex) === this.currentTrack.trackIndex) {
            continue;
          }
          return Number(trackIndex);
        }
      }
      return null;
    },
    onResize() {
      this.setCanvasDimensions();
    },
    setCanvasDimensions() {
      const canvasDimensions = this.$refs.canvas.getBoundingClientRect();
      this.canvasWidth = canvasDimensions.width;
      this.scale = this.canvasWidth / 160;
      this.canvasHeight = canvasDimensions.width * 0.75;
      const devicePixelRatio = window.devicePixelRatio;
      const canvas = this.$refs.overlayCanvas;
      canvas.width = this.canvasWidth * devicePixelRatio;
      canvas.height = this.canvasHeight * devicePixelRatio;
      canvas.style.width = `${this.canvasWidth}px`;
      canvas.style.height = `${this.canvasHeight}px`;
      const context = canvas.getContext("2d");
      this.$refs.container.style.maxHeight = `${this.canvasHeight}px`;
      context.scale(devicePixelRatio, devicePixelRatio);
      if (this.header) {
        this.renderCurrentFrame();
      }
    },
    async setTimeAndRedraw(time) {
      let totalFrames = this.totalFrames;
      if (this.header) {
        if (totalFrames === false) {
          totalFrames = Math.floor(this.actualDuration * this.header.fps);
        }
        this.frameNum = Math.floor(
          Math.min(totalFrames - 1, (time / this.actualDuration) * totalFrames)
        );
        this.animationTick = 0;
        await this.renderCurrentFrame(true);
      }
    },
    async renderCurrentFrame(force: boolean = false, frameNum?: number) {
      if (this.header) {
        this.loadProgress = player.getLoadProgress();
        if (frameNum === undefined) {
          frameNum = this.frameNum;
        }
        this.buffering = true;

        performance.mark(`Start frame #${frameNum}`);
        // TODO(jon): Ideally we want this to happen on another thread an call back to us, otherwise it locks the UI.
        const { frameNum: actualFrameNum, frameData } = await this.queueFrame(
          frameNum
        );
        performance.mark(`End frame #${frameNum}`);
        performance.measure(
          `Frame #${frameNum}`,
          `Start frame #${frameNum}`,
          `End frame #${frameNum}`
        );
        this.buffering = false;
        this.renderFrame(frameData, actualFrameNum, force);
        return frameNum === actualFrameNum;
      }
      return false;
    },
    startScrub() {
      this.wasPaused = !this.playing;
      if (!this.wasPaused) {
        this.pause();
      }
      this.isScrubbing = true;
    },
    endScrub() {
      if (!this.wasPaused) {
        this.play();
      }
      this.isScrubbing = false;
    },
    async play() {
      this.playing = true;
      await this.fetchRenderAdvanceFrame();
    },
    async togglePlayback() {
      if (!this.playing) {
        if (this.atEndOfPlayback) {
          this.frameNum = 0;
          this.animationTick = 0;
        }
        await this.play();
      } else {
        this.pause();
      }
    },
    pause() {
      this.playing = false;
      cancelAnimationFrame(this.animationFrame);
    },
  },
};
</script>

<style scoped lang="scss">
.video-container {
  margin: 0 auto;
  position: relative;
  width: 100%;
  padding: 0;
  background: black;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  overflow: hidden;
  .track-scrubber {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
}
canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  &.smoothed {
    image-rendering: auto;
  }
}
.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
}
.time,
.temp,
.value-tooltip {
  position: absolute;
  right: 7px;
  bottom: 7px;
  font-size: 12px;
  line-height: 12px;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 3px;
  user-select: none;
  pointer-events: none;
}
.temp {
  //top: 7px;
  left: 7px;
  right: unset;
  //bottom: unset;
}
.value-tooltip {
  bottom: unset;
  right: unset;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;

    transform: scale(1.2);
  }
  100% {
    opacity: 0;
  }
}

@-moz-keyframes fadeInOut {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-webkit-keyframes fadeInOut {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.player-messaging {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  display: block;
  bottom: 50px;
  color: white;
  font-size: 20px;
  opacity: 0;
  transform-origin: center;
  &.show {
    animation: fadeInOut 1s;
    -webkit-animation: fadeInOut 1s;
    -moz-animation: fadeInOut 1s;
    -o-animation: fadeInOut 1s;
    -ms-animation: fadeInOut 1s;
  }
}

.playback-controls {
  color: white;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.2) 80%,
    rgba(0, 0, 0, 0) 100%
  );
  opacity: 0;
  transition: opacity 0.3s;
  &.show {
    opacity: 1;
    pointer-events: unset;
  }
  > button {
    height: 26.666%;
    width: 20%;
    > svg {
      transition: opacity 0.3s;
      opacity: 0.5;
    }
    &:hover {
      > svg {
        opacity: 0.8;
      }
    }
    background: transparent;
    &:focus,
    &:active {
      outline: none;
    }
    color: inherit;
    border: 0;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }
}

.playback-nav {
  min-height: 44px;
  background: #2b333f;
  color: white;
  display: flex;
  position: relative;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  //border-top: 1px solid rgb(77, 86, 97);
  button {
    min-width: 44px;
    min-height: 44px;
    background: transparent;
    &:focus,
    &:active {
      outline: none;
    }
    &:active,
    &.selected {
      color: yellowgreen;
    }
    color: inherit;
    border: 0;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  .advanced-controls {
    width: 44px;
    height: 44px;
    overflow: hidden;
    user-select: none;
    transition: width 0.3s ease-in-out;
    &.open {
      width: 550px;
      .advanced-controls-btn {
        position: relative;
        &::before {
          position: absolute;
          top: 11px;
          left: 11px;
          content: "";
          background: rgba(255, 255, 255, 0.1);
          border-radius: 11px;
          width: 22px;
          height: 22px;
        }
      }
    }
  }
}
.progress-text {
  text-align: center;
  user-select: none;
}
</style>
