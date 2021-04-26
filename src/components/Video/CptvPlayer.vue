<template>
  <div :class="{ standAlone: 'stand-alone' }">
    <div key="container" class="video-container" ref="container">
      <canvas
        key="base"
        ref="canvas"
        :class="['video-canvas', { smoothed: smoothed }]"
      />
      <canvas key="overlay" ref="overlayCanvas" class="overlay-canvas" />
      <span
        key="messaging"
        :class="['player-messaging', { show: playerMessage !== null }]"
        v-html="playerMessage"
      />
      <span
        key="px-value"
        v-show="showValueInfo"
        ref="valueTooltip"
        class="value-tooltip"
        >{{ valueUnderCursor }}
      </span>
      <div
        key="buffering"
        :class="['playback-controls', { show: isBuffering }]"
      >
        <font-awesome-icon class="fa-spin buffering" icon="spinner" size="4x" />
      </div>
      <div
        key="playback-controls"
        :class="['playback-controls', { show: atEndOfPlayback && !extLoading }]"
      >
        <button
          @click="requestPrevRecording"
          :disabled="!canGoBackwards || standAlone"
          :class="{ hide: standAlone }"
        >
          <font-awesome-icon icon="backward" class="replay" />
        </button>
        <button @click="togglePlayback">
          <font-awesome-icon icon="redo-alt" class="replay" rotation="270" />
        </button>
        <button
          @click="requestNextRecording"
          :disabled="!canGoForwards || standAlone"
          :class="{ hide: standAlone }"
        >
          <font-awesome-icon icon="forward" class="replay" />
        </button>
      </div>
    </div>

    <div key="playback-nav" class="playback-nav">
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
      <div class="right-nav">
        <div
          :class="['advanced-controls', { open: showAdvancedControls }]"
          v-if="!standAlone"
        >
          <button
            @click="toggleAdvancedControls"
            class="advanced-controls-btn"
            ref="advancedControlsButton"
          >
            <font-awesome-icon
              icon="angle-right"
              :rotation="showAdvancedControls ? null : 180"
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
              v-if="smoothed"
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 18 18"
              width="16"
              height="20"
            >
              <g transform="matrix(1,0,0,1,0,-249)" style="fill: white">
                <path
                  d="M5.25,248.969L5.25,251.781C5.25,252.247 4.872,252.625 4.406,252.625L0.844,252.625C0.378,252.625 0,252.247 0,251.781L0,248.969C0,248.503 0.378,248.125 0.844,248.125L4.406,248.125C4.872,248.125 5.25,248.503 5.25,248.969Z"
                  style="fill-opacity: 0.25"
                />
                <path
                  d="M11.625,257.406L11.625,254.594C11.625,254.128 11.247,253.75 10.781,253.75L7.219,253.75C6.753,253.75 6.375,254.128 6.375,254.594L6.375,257.406C6.375,257.872 6.753,258.25 7.219,258.25L10.781,258.25C11.247,258.25 11.625,257.872 11.625,257.406Z"
                />
                <path
                  d="M12.75,248.969L12.75,251.781C12.75,252.247 13.128,252.625 13.594,252.625L17.156,252.625C17.622,252.625 18,252.247 18,251.781L18,248.969C18,248.503 17.622,248.125 17.156,248.125L13.594,248.125C13.128,248.125 12.75,248.503 12.75,248.969Z"
                  style="fill-opacity: 0.8"
                />
                <path
                  d="M11.625,251.781L11.625,248.969C11.625,248.503 11.247,248.125 10.781,248.125L7.219,248.125C6.753,248.125 6.375,248.503 6.375,248.969L6.375,251.781C6.375,252.247 6.753,252.625 7.219,252.625L10.781,252.625C11.247,252.625 11.625,252.247 11.625,251.781Z"
                  style="fill-opacity: 0.5"
                />
                <path
                  d="M4.406,253.75L0.844,253.75C0.378,253.75 0,254.128 0,254.594L0,257.406C0,257.872 0.378,258.25 0.844,258.25L4.406,258.25C4.872,258.25 5.25,257.872 5.25,257.406L5.25,254.594C5.25,254.128 4.872,253.75 4.406,253.75Z"
                  style="fill-opacity: 0.5"
                />
                <path
                  d="M0,260.219L0,263.031C0,263.497 0.378,263.875 0.844,263.875L4.406,263.875C4.872,263.875 5.25,263.497 5.25,263.031L5.25,260.219C5.25,259.753 4.872,259.375 4.406,259.375L0.844,259.375C0.378,259.375 0,259.753 0,260.219Z"
                  style="fill-opacity: 0.8"
                />
                <path
                  d="M13.594,258.25L17.156,258.25C17.622,258.25 18,257.872 18,257.406L18,254.594C18,254.128 17.622,253.75 17.156,253.75L13.594,253.75C13.128,253.75 12.75,254.128 12.75,254.594L12.75,257.406C12.75,257.872 13.128,258.25 13.594,258.25Z"
                />
                <path
                  d="M13.594,263.875L17.156,263.875C17.622,263.875 18,263.497 18,263.031L18,260.219C18,259.753 17.622,259.375 17.156,259.375L13.594,259.375C13.128,259.375 12.75,259.753 12.75,260.219L12.75,263.031C12.75,263.497 13.128,263.875 13.594,263.875Z"
                />
                <path
                  d="M6.375,260.219L6.375,263.031C6.375,263.497 6.753,263.875 7.219,263.875L10.781,263.875C11.247,263.875 11.625,263.497 11.625,263.031L11.625,260.219C11.625,259.753 11.247,259.375 10.781,259.375L7.219,259.375C6.753,259.375 6.375,259.753 6.375,260.219Z"
                />
              </g>
            </svg>

            <svg v-else width="16" height="18" viewBox="0 0 18 18">
              <g transform="matrix(1,0,0,1,0,-2)" style="fill: white">
                <path
                  d="M1.294,16.976L18.709,17.063L18.853,0.932C9.155,0.932 1.294,7.279 1.294,16.976Z"
                />
              </g>
            </svg>
          </button>
          <b-tooltip
            v-if="$refs.toggleSmoothingButton"
            :target="$refs.toggleSmoothingButton"
            :title="smoothed ? 'Disable smoothing' : 'Enable smoothing'"
            triggers="hover"
          />

          <!--        <button @click="toggleHistogram" ref="toggleHistogramButton">-->
          <!--          <font-awesome-icon icon="chart-bar" />-->
          <!--        </button>-->
          <!--        <b-tooltip-->
          <!--          v-if="$refs.toggleHistogramButton"-->
          <!--          :target="$refs.toggleHistogramButton"-->
          <!--          :title="showingHistogram ? 'Hide histogram' : 'Show histogram'"-->
          <!--          triggers="hover"-->
          <!--        />-->

          <!--        <button-->
          <!--          @click="togglePicker"-->
          <!--          :class="{ selected: showValueInfo }"-->
          <!--          ref="toggleValuePicker"-->
          <!--        >-->
          <!--          <font-awesome-icon icon="eye-dropper" />-->
          <!--        </button>-->
          <!--        <b-tooltip-->
          <!--          v-if="$refs.toggleValuePicker"-->
          <!--          :target="$refs.toggleValuePicker"-->
          <!--          :title="-->
          <!--            showValueInfo-->
          <!--              ? 'Disable picker'-->
          <!--              : 'Show raw pixel values under cursor'-->
          <!--          "-->
          <!--          triggers="hover"-->
          <!--        />-->

          <!--        <button-->
          <!--          v-if="hasBackgroundFrame"-->
          <!--          ref="showBackgroundFrame"-->
          <!--          @mousedown="toggleBackground"-->
          <!--          @mouseup="toggleBackground"-->
          <!--        >-->
          <!--          <font-awesome-icon icon="image" />-->
          <!--        </button>-->
          <!--        <b-tooltip-->
          <!--          v-if="hasBackgroundFrame && $refs.showBackgroundFrame"-->
          <!--          :target="$refs.showBackgroundFrame"-->
          <!--          title="Press to show background frame"-->
          <!--          triggers="hover"-->
          <!--        />-->

          <button @click="incrementPalette" ref="cyclePalette">
            <font-awesome-icon icon="palette" />
          </button>
          <b-tooltip
            v-if="$refs.cyclePalette"
            :target="$refs.cyclePalette"
            title="Cycle colour map"
            triggers="hover"
          />

          <!--        <button @click="stepBackward" ref="stepBackward">-->
          <!--          <font-awesome-icon icon="step-backward" />-->
          <!--        </button>-->
          <!--        <b-tooltip-->
          <!--          v-if="$refs.stepBackward"-->
          <!--          :target="$refs.stepBackward"-->
          <!--          title="Go back one frame"-->
          <!--          triggers="hover"-->
          <!--        />-->
          <!--        <button @click="stepForward" ref="stepForward">-->
          <!--          <font-awesome-icon icon="step-forward" />-->
          <!--        </button>-->
          <!--        <b-tooltip-->
          <!--          v-if="$refs.stepForward"-->
          <!--          :target="$refs.stepForward"-->
          <!--          title="Go forward one frame"-->
          <!--          triggers="hover"-->
          <!--        />-->

          <!--        <button>-->
          <!--          <font-awesome-icon :icon="['far', 'file']" />-->
          <!--        </button>-->

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
        <button
          @click="incrementSpeed"
          ref="cyclePlaybackSpeed"
          class="playback-speed"
        >
          <span>{{ speedMultiplier }}x</span>
        </button>
        <b-tooltip
          v-if="$refs.cyclePlaybackSpeed"
          :target="$refs.cyclePlaybackSpeed"
          title="Cycle playback speed"
          triggers="hover"
        />
      </div>
    </div>
    <div class="tracks-container">
      <VideoTracksScrubber
        :class="{ 'ended-playback': ended }"
        ref="scrubber"
        key="scrubber"
        :duration="actualDuration"
        :tracks="tracks"
        :time-adjustment-for-background-frame="timeAdjustmentForBackgroundFrame"
        :current-track="currentTrack.trackIndex"
        :canvas-width="canvasWidth"
        :side-padding="scrubberSidePadding"
        @start-scrub="startScrub"
        @end-scrub="endScrub"
        @set-playback-time="setTimeAndRedraw"
      />
      <canvas
        key="playhead"
        ref="playhead"
        class="playhead"
        :width="canvasWidth * devicePixelRatio"
        height="1"
      />
    </div>
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
    <b-modal
      title="Export options"
      v-model="showAdvancedExportOptions"
      ok-title="Export"
      @ok="exportMp4(trackExportOptions)"
    >
      <b-form-group label="Include tracks in exported timespan">
        <b-form-checkbox
          v-for="(track, index) in trackExportOptions"
          :key="index"
          v-model="track.includeInExportTime"
          >Track {{ track.trackIndex + 1 }}</b-form-checkbox
        >
      </b-form-group>
      <b-form-group label="Display track boxes in export">
        <b-form-checkbox
          v-for="(track, index) in trackExportOptions"
          :key="index"
          v-model="track.displayInExport"
          >Track {{ track.trackIndex + 1 }}</b-form-checkbox
        >
      </b-form-group>
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
  CptvPlayerInstance as CptvPlayer,
  ensureEntireClipIsDecoded,
  queueFrame,
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

import defaultColormap from "./DefaultColourmap";

const mapRgba = ([r, g, b]) =>
  (255 << 24) | ((b * 255.0) << 16) | ((g * 255.0) << 8) | (r * 255.0);

const Viridis = Object.freeze(viridis.map(mapRgba));
const Plasma = Object.freeze(plasma.map(mapRgba));
const Inferno = Object.freeze(inferno.map(mapRgba));
const Magma = Object.freeze(magma.map(mapRgba));
const Default = Object.freeze(
  defaultColormap.map(([r, g, b]) => (255 << 24) | (b << 16) | (g << 8) | r)
);
const greysSq = [];
const greys = [];
const inc = 1 / 255;
for (let i = 0; i <= 1; i += inc) {
  greysSq.push(mapRgba([i * i, i * i, i * i]));
  greys.push(mapRgba([i, i, i]));
}

const Greyscale = Object.freeze(greys);
const GreyscaleSquared = Object.freeze(greysSq);
const ColourMaps = Object.freeze([
  ["Default", Default],
  ["Viridis", Viridis],
  ["Plasma", Plasma],
  ["Inferno", Inferno],
  ["Magma", Magma],
  ["Greyscale", Greyscale],
  ["Grayscale<sup>2</sup>", GreyscaleSquared],
]);

const PlaybackSpeeds = Object.freeze([0.5, 1, 2, 4, 6]);

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
  const userTags = trackTags.filter(
    (tag) =>
      (tag.user !== undefined && tag.user !== null) ||
      (tag.User !== undefined && tag.User !== null)
  );
  if (userTags.length) {
    return userTags[0].what;
  } else {
    const tag = trackTags.find(
      (tag) => (tag.data && tag.data === "Master") || tag.data.name === "Master"
    );
    if (tag) {
      return tag.what;
    }
  }
  return null;
};

let lastCptvUrl = null;
let frameBuffer: Uint8ClampedArray;

const formatHeaderInfo = (header): string | null => {
  if (header) {
    const {
      width,
      height,
      fps,
      deviceName,
      deviceId,
      previewSecs,
      brand,
      model,
      serialNumber,
      firmwareVersion,
      motionConfig,
      timestamp,
      hasBackgroundFrame,
    } = header;
    const headerInfo = {
      dimensions: `${width} x ${height}`,
      fps,
      time: new Date(timestamp / 1000).toLocaleString(),
      "has background": hasBackgroundFrame,
      "preview seconds": previewSecs,
    };
    if (deviceName) {
      headerInfo["device name"] = deviceName;
    }
    if (deviceId) {
      headerInfo["device ID"] = deviceId;
    }
    if (brand && model) {
      headerInfo["sensor"] = `${brand} ${model}`;
    }
    if (serialNumber) {
      headerInfo["serial"] = `#${serialNumber}`;
    }
    if (firmwareVersion) {
      headerInfo["firmware"] = firmwareVersion;
    }
    if (motionConfig) {
      headerInfo["motion config"] = motionConfig
        .split("\n")
        .reduce((acc, item) => {
          const parts = item.split(": ");
          if (Number(parts[1]) == parts[1]) {
            acc[parts[0]] = Number(parts[1]);
          } else {
            acc[parts[0]] = parts[1];
          }
          return acc;
        }, {});
    }
    return JSON.stringify(headerInfo, null, "  ");
  } else {
    return null;
  }
};

interface TrackBox {
  what: string;
  rect: [number, number, number, number];
}

export default {
  name: "CptvPlayer",
  components: {
    VideoTracksScrubber,
  },
  props: {
    extLoading: {
      type: Boolean,
      default: false,
    },
    cptvUrl: {
      type: String,
      required: true,
    },
    cptvSize: {
      type: Number,
      required: true,
    },
    canSelectTracks: {
      type: Boolean,
      default: true,
    },
    showOverlaysForCurrentTrackOnly: {
      type: Boolean,
      default: false,
    },
    standAlone: {
      // For embedding in bulk tagger, where there is no prev/next context
      type: Boolean,
      default: false,
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
    recentlyAddedTag: {
      type: Object,
      default: null,
    },
    canGoBackwards: {
      type: Boolean,
      default: false,
    },
    canGoForwards: {
      type: Boolean,
      default: false,
    },
    exportRequested: {
      type: [Boolean, String],
      default: false,
    },
  },
  data(): {
    header: CptvHeader;
    frameHeader: CptvFrameHeader;
  } {
    return {
      atEndOfPlayback: false, //this.header && this.totalFrames && this.frameNum === this.totalFrames
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
      colourMap: Default,
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
      scrubberSidePadding: 1,
      devicePixelRatio: 1,
      windowWidth: window.innerWidth,
      showAdvancedExportOptions: false,
      trackExportOptions: [],
    };
  },
  computed: {
    isBuffering() {
      return this.extLoading || this.buffering;
    },
    scrubberWidth() {
      return this.canvasWidth - this.scrubberSidePadding * 2;
    },
    playheadOffsetForCurrentTime() {
      const pixelsPerSecond = this.scrubberWidth / this.actualDuration;
      return (
        this.scrubberSidePadding +
        Math.min(this.scrubberWidth, pixelsPerSecond * this.currentTime60fps)
      );
    },
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
          what: (TrackTags && getAuthoritativeTagForTrack(TrackTags)) || null,
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
        return this.totalFrames / this.header.fps;
      }
      return Math.max(
        ...this.tracks.map(
          (track) => track.data.end_s - this.timeAdjustmentForBackgroundFrame
        ),
        this.duration - this.timeAdjustmentForBackgroundFrame
      );
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
        return `About ${Math.round(this.frameHeader.frameTempC)}ºC`;
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
    speedMultiplier() {
      return PlaybackSpeeds[this.speedMultiplierIndex];
    },
    headerInfo() {
      return formatHeaderInfo(this.header);
    },
    exportOptions() {
      return this.tracks
        .map((track) => ({
          includeInExportTime: true,
          displayInExport: true,
          trackIndex: track.trackIndex,
        }))
        .sort((a, b) => a.trackIndex - b.trackIndex);
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
    this.$refs.canvas.width = 160;
    this.$refs.canvas.height = 120;
    window.addEventListener("resize", this.onResize);
    window
      .matchMedia("screen and (min-resolution: 2dppx)")
      .addEventListener("change", this.setCanvasDimensions);

    this.setCanvasDimensions();
    this.buffering = true;
    if (this.canSelectTracks) {
      const canvas = this.$refs.overlayCanvas;
      canvas.addEventListener("click", this.clickOverlayCanvas);
      canvas.addEventListener("mousemove", this.moveOverOverlayCanvas);
    }
    if (lastCptvUrl !== this.cptvUrl) {
      await this.initPlayer();
    } else {
      this.clearCanvas();
    }

    this.initTrackExportOptions();
  },
  beforeDestroy() {
    this.loadedStream = false;
    this.clearCanvas();
    if (this.canSelectTracks) {
      const canvas = this.$refs.overlayCanvas;
      canvas.removeEventListener("click", this.clickOverlayCanvas);
      canvas.removeEventListener("mousemove", this.moveOverOverlayCanvas);
    }
    window.removeEventListener("resize", this.onResize);
    window
      .matchMedia("screen and (min-resolution: 2dppx)")
      .removeEventListener("change", this.setCanvasDimensions);
  },
  watch: {
    async exportRequested() {
      if (this.exportRequested) {
        if (this.exportRequested === "advanced") {
          this.showAdvancedExportOptions = true;
          this.initTrackExportOptions();
        } else {
          await this.exportMp4();
          this.$emit("export-complete");
        }
      }
    },
    currentTrack() {
      if (this.playing) {
        this.selectTrack(true);
      } else {
        this.selectTrack(true, true);
        if (this.processedTracks && this.processedTracks.length) {
          this.frameNum = this.firstFrameForTrack(this.currentTrack.trackIndex);
        }
        this.renderOverlay(
          this.$refs.overlayCanvas.getContext("2d"),
          this.scale,
          this.secondsSinceLastFFC,
          false,
          this.frameNum
        );
      }
    },
    recentlyAddedTag() {
      // Update the box label for a recently added tag
      this.renderOverlay(
        this.$refs.overlayCanvas.getContext("2d"),
        this.scale,
        this.secondsSinceLastFFC,
        false,
        this.frameNum
      );
    },
    cptvUrl() {
      if (this.cptvUrl !== lastCptvUrl) {
        this.initPlayer();
      }
    },
    tracks() {
      this.trackExportOptions = this.exportOptions;
    },
  },
  methods: {
    initTrackExportOptions() {
      this.trackExportOptions = this.exportOptions;
    },
    firstFrameForTrack(trackIndex: number): number {
      return this.processedTracks.findIndex((tracks) =>
        Object.keys(tracks).map(Number).includes(trackIndex)
      );
    },
    async initPlayer() {
      this.loadedStream = false;
      this.streamLoadError = null;
      this.clearCanvas();
      this.atEndOfPlayback = false;
      this.frameNum = 0;
      this.animationTick = 0;
      this.totalFrames = false;
      this.playing = true;
      this.wasPaused = true;
      this.$refs.canvas.width = 160;
      this.$refs.canvas.height = 120;
      cancelAnimationFrame(this.animationFrame);
      this.loadedStream = await CptvPlayer.initWithCptvUrlAndSize(
        this.cptvUrl,
        this.cptvSize
      );
      if (this.loadedStream === "Failed to verify JWT.") {
        window.location.reload();
      } else if (this.loadedStream === true) {
        lastCptvUrl = this.cptvUrl;
        this.header = Object.freeze(await CptvPlayer.getHeader());
        this.$emit("ready-to-play");
        frameBuffer = new Uint8ClampedArray(
          this.header.width * this.header.height * 4
        );
        this.$refs.canvas.width = this.header.width;
        this.$refs.canvas.height = this.header.height;
        cancelAnimationFrame(this.animationFrame);
        await this.fetchRenderAdvanceFrame();
        this.buffering = false;
      } else {
        this.streamLoadError = this.loadedStream;
      }
    },
    selectTrack(force: boolean = false, shouldPlay: boolean = false) {
      if (!this.playing || force) {
        if (this.currentTrack.start_s !== undefined) {
          if (
            this.processedTracks &&
            this.currentTrack.trackIndex <
              Object.keys(this.processedTracks).length
          ) {
            cancelAnimationFrame(this.animationFrame);
            this.setTimeAndRedraw(this.currentTrack.start_s + 0.01);
            if (shouldPlay) {
              this.play();
            }
          }
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
    async stepForward() {
      this.pause();
      this.animationTick = 0;
      const canAdvance = await this.renderCurrentFrame(true, this.frameNum + 1);
      if (canAdvance) {
        this.frameNum++;
      }
    },
    async stepBackward() {
      this.pause();
      this.animationTick = 0;
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
        const frameData = CptvPlayer.getFrameAtIndex(this.frameNum - 1);
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
    async exportMp4(
      trackExportOptions?: {
        includeInExportTime: boolean;
        displayInExport: boolean;
        trackIndex: number;
      }[]
    ) {
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
      this.totalFrames = await ensureEntireClipIsDecoded();

      let startFrame = 0;
      let onePastLastFrame = this.totalFrames;
      if (
        trackExportOptions &&
        trackExportOptions.filter((track) => track.includeInExportTime)
          .length !== 0
      ) {
        startFrame = this.totalFrames;
        onePastLastFrame = 0;
        for (const { includeInExportTime, trackIndex } of trackExportOptions) {
          if (includeInExportTime) {
            const track = this.tracks[trackIndex];
            startFrame = Math.min(
              startFrame,
              this.getFrameAtTime(track.data.start_s - 1)
            );
            onePastLastFrame = Math.max(
              onePastLastFrame,
              this.getFrameAtTime(track.data.end_s + 1)
            );
          }
        }
      }

      encoder.initialize();
      let frameNum = startFrame;

      await yieldToUI();
      // console.assert(this.totalFrames !== null);
      while (frameNum < onePastLastFrame) {
        const frameData = CptvPlayer.getFrameAtIndex(frameNum);
        const frameHeader = CptvPlayer.getFrameHeaderAtIndex(frameNum);
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
          frameNum,
          trackExportOptions
        );

        encoder.addFrameRgba(
          context.getImageData(0, 0, encoder.width, encoder.height).data
        );
        this.exportProgress =
          (frameNum - startFrame) / (onePastLastFrame - startFrame);
        await yieldToUI();
        frameNum++;
      }
      encoder.finalize();

      // Reset any export options
      this.initTrackExportOptions();

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
        // console.log("Clamped min", thisMin);
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
      if (this.$refs.canvas) {
        const context = this.$refs.canvas.getContext("2d");
        if (frameNum !== false) {
          this.frameHeader = Object.freeze(
            CptvPlayer.getFrameHeaderAtIndex(frameNum)
          );
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
      }
    },
    async drawFrame(context, imgData, frameNum, force = false) {
      if (context) {
        // One tick represents 1000 / fps * multiplier
        const everyXTicks = Math.max(
          1,
          Math.floor(60 / (this.header.fps * this.speedMultiplier))
        );
        // NOTE: respect fps here, render only when we should.
        const shouldRedraw =
          (this.animationTick + (this.playing ? 1 : 0)) % everyXTicks === 0;
        if (context && (shouldRedraw || force)) {
          context.putImageData(imgData, 0, 0);
          if (this.$refs.overlayCanvas) {
            const overlayContext = this.$refs.overlayCanvas.getContext("2d");
            this.renderOverlay(
              overlayContext,
              this.scale,
              this.secondsSinceLastFFC,
              false,
              frameNum
            );

            {
              overlayContext.font = "13px sans-serif";
              overlayContext.lineWidth = 4;
              overlayContext.strokeStyle = "rgba(0, 0, 0, 0.5)";
              overlayContext.fillStyle = "white";
              const time = `${this.elapsedTime} / ${Math.max(
                this.elapsedTime,
                this.totalTime
              )}`;
              overlayContext.font;
              const timeWidth =
                overlayContext.measureText(time).width * this.devicePixelRatio;
              overlayContext.strokeText(
                time,
                (overlayContext.canvas.width -
                  (timeWidth + 10 * this.devicePixelRatio)) /
                  this.devicePixelRatio,
                (overlayContext.canvas.height - 20) / this.devicePixelRatio
              );
              overlayContext.fillText(
                time,
                (overlayContext.canvas.width -
                  (timeWidth + 10 * this.devicePixelRatio)) /
                  this.devicePixelRatio,
                (overlayContext.canvas.height - 20) / this.devicePixelRatio
              );

              const ambientTemp = this.ambientTemperature;
              if (ambientTemp) {
                overlayContext.strokeText(
                  ambientTemp,
                  10,
                  (overlayContext.canvas.height - 20) / this.devicePixelRatio
                );
                overlayContext.fillText(
                  ambientTemp,
                  10,
                  (overlayContext.canvas.height - 20) / this.devicePixelRatio
                );
              }
            }
            // Draw time and temperature in
            //overlayContext.
          }
          let didAdvance = false;
          if (this.playing) {
            didAdvance = await this.fetchRenderAdvanceFrame();
          }
          if (didAdvance) {
            this.animationTick = 0;
            this.frameNum++;
          } else {
            this.animationTick++;
          }
          // Check if we're at the end:
          if (
            this.header &&
            this.totalFrames &&
            this.frameNum === this.totalFrames
          ) {
            this.atEndOfPlayback = true;
          }
        } else if (context) {
          this.animationTick++;
          cancelAnimationFrame(this.animationFrame);
          this.animationFrame = requestAnimationFrame(() =>
            this.drawFrame(context, imgData, frameNum)
          );
        }

        // Update playhead:
        const playhead = this.$refs.playhead;
        if (playhead) {
          const playheadContext = playhead.getContext("2d");
          playheadContext.fillStyle = "rgba(0, 0, 0, 0.35)";
          playheadContext.clearRect(0, 0, playhead.width, playhead.height);
          const playheadX =
            this.playheadOffsetForCurrentTime * this.devicePixelRatio;
          playheadContext.fillRect(0, 0, playheadX, playhead.height);
          playheadContext.lineWidth = this.devicePixelRatio;
          playheadContext.strokeStyle = "white";
          playheadContext.beginPath();
          playheadContext.moveTo(playheadX, 0);
          playheadContext.lineTo(playheadX, playhead.height);
          playheadContext.stroke();
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
      frameNum: number,
      trackExportOptions?
    ) {
      if (!isExporting) {
        // Clear if we are drawing on the live overlay, but not if we're drawing for export
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      }
      const tracks =
        this.processedTracks[frameNum] || ({} as Record<number, TrackBox>);
      const frameTracks = Object.entries(tracks);
      if (!isExporting && this.canSelectTracks && frameTracks.length === 1) {
        const trackIndex = Number(frameTracks[0][0]);
        // If the track is the only track at this time offset, make it the selected track.
        if (this.currentTrack.trackIndex !== trackIndex) {
          this.$emit("track-selected", {
            trackIndex,
          });
        }
      }

      if (!this.showOverlaysForCurrentTrackOnly || isExporting) {
        for (const [trackIndex, trackBox] of frameTracks) {
          if (this.currentTrack.trackIndex !== Number(trackIndex)) {
            if (
              !trackExportOptions ||
              trackExportOptions[Number(trackIndex)].displayInExport
            ) {
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
        }
      }
      // Always draw selected track last, so it sits on top of any overlapping tracks.
      for (const [trackIndex, trackBox] of frameTracks) {
        if (this.currentTrack.trackIndex === Number(trackIndex)) {
          if (
            !trackExportOptions ||
            trackExportOptions[Number(trackIndex)].displayInExport
          ) {
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
      what: string | null,
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
        if (what !== null) {
          const text = what;
          const textHeight = 9 * deviceRatio;
          const textWidth = context.measureText(text).width * deviceRatio;
          const marginX = 2 * deviceRatio;
          const marginTop = 2 * deviceRatio;
          let textX =
            Math.min(context.canvas.width, right) - (textWidth + marginX);
          let textY = bottom + textHeight + marginTop;
          // Make sure the text doesn't get clipped off if the box is near the frame edges
          if (textY + textHeight > context.canvas.height) {
            textY = top - textHeight;
          }
          if (textX < 0) {
            textX = left + marginX;
          }
          context.font = "13px sans-serif";
          context.lineWidth = 4;
          context.strokeStyle = "rgba(0, 0, 0, 0.5)";
          context.strokeText(text, textX / deviceRatio, textY / deviceRatio);
          context.fillStyle = "white";
          context.fillText(text, textX / deviceRatio, textY / deviceRatio);
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
        const background = CptvPlayer.getBackgroundFrame();
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
      // Only trigger if width has changed, since scrolling on mobile will hide the browser chrome at top
      // and trigger a resize
      if (window.innerWidth !== this.windowWidth) {
        this.windowWidth = window.innerWidth;
        this.animationTick = 0;
        this.setCanvasDimensions();
      }
    },
    setCanvasDimensions() {
      const canvasDimensions = this.$refs.canvas.getBoundingClientRect();
      this.canvasWidth = canvasDimensions.width;
      this.scale = this.canvasWidth / 160;
      this.canvasHeight = canvasDimensions.width * 0.75;
      this.devicePixelRatio = window.devicePixelRatio;
      const canvas = this.$refs.overlayCanvas;
      canvas.width = this.canvasWidth * this.devicePixelRatio;
      canvas.height = this.canvasHeight * this.devicePixelRatio;
      canvas.style.width = `${this.canvasWidth}px`;
      canvas.style.height = `${this.canvasHeight}px`;
      const context = canvas.getContext("2d");
      this.$refs.container.style.maxHeight = `${this.canvasHeight}px`;
      context.scale(this.devicePixelRatio, this.devicePixelRatio);
      if (this.header) {
        this.renderCurrentFrame();
      }
    },
    getFrameAtTime(time: number): number {
      let totalFrames = this.totalFrames;
      time = Math.max(0, Math.min(this.actualDuration, time));
      if (this.header) {
        if (totalFrames === false) {
          totalFrames = Math.floor(this.actualDuration * this.header.fps);
        }
        return Math.floor(
          Math.min(totalFrames, (time / this.actualDuration) * totalFrames)
        );
      }
      return 0;
    },
    async setTimeAndRedraw(time) {
      let totalFrames = this.totalFrames;
      if (this.header) {
        if (totalFrames === false) {
          totalFrames = Math.floor(this.actualDuration * this.header.fps);
        }
        this.animationTick = 0;
        this.frameNum = Math.floor(
          Math.min(totalFrames, (time / this.actualDuration) * totalFrames)
        );
        if (this.atEndOfPlayback) {
          this.atEndOfPlayback = this.frameNum === totalFrames;
        }
        await this.renderCurrentFrame(true);
      }
    },
    async renderCurrentFrame(force: boolean = false, frameNum?: number) {
      if (this.header) {
        this.loadProgress = CptvPlayer.getLoadProgress();
        if (frameNum === undefined) {
          frameNum = this.frameNum;
        }
        // TODO(jon): Ideally we want this to happen on another thread an call back to us, otherwise it locks the UI.
        const {
          frameNum: actualFrameNum,
          frameData,
          totalFrames,
        } = await queueFrame(
          frameNum,
          (buffering) => (this.buffering = buffering)
        );
        if (totalFrames !== null && !this.totalFrames) {
          this.totalFrames = totalFrames;
        }
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
          this.atEndOfPlayback = false;
        }
        await this.play();
      } else {
        this.pause();
      }
    },
    requestPrevRecording() {
      this.frameNum = 0;
      this.buffering = true;
      this.atEndOfPlayback = false;
      this.$emit("request-prev-recording");
    },
    requestNextRecording() {
      this.frameNum = 0;
      this.atEndOfPlayback = false;
      this.buffering = true;
      this.$emit("request-next-recording");
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
.video-canvas {
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
  justify-content: space-evenly;
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
    min-width: 44px;
    min-height: 44px;
    &.hide {
      opacity: 0;
    }
    > svg {
      transition: opacity 0.3s;
      opacity: 0.5;
    }
    &:hover:not(:disabled) {
      > svg {
        opacity: 0.8;
      }
    }
    &:disabled {
      > svg {
        opacity: 0.1;
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

.replay,
.buffering {
  min-width: 44px;
  min-height: 44px;
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
      width: 190px;
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
.right-nav {
  display: flex;
}
.progress-text {
  text-align: center;
  user-select: none;
}
.tracks-container {
  position: relative;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  overflow: hidden;
  margin-bottom: 5px;
}
.playhead {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
}
.playback-speed {
  font-weight: bold;
  font-size: 90%;
}
</style>
