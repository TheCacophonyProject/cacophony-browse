<template>
  <div class="video-container" ref="container">
    <canvas ref="canvas" :class="{ smoothed: smoothed }" />
    <canvas ref="overlayCanvas" class="overlay-canvas" />
    <VideoTracksScrubber
      :class="{ 'ended-playback': ended }"
      ref="scrubber"
      :duration="actualDuration"
      :tracks="tracks"
      :current-video-time="currentTime"
      :current-track="currentTrack.trackIndex"
      :canvas-width="canvasWidth"
      :side-padding="1"
      @start-scrub="startScrub"
      @end-scrub="endScrub"
      @set-playback-time="setTimeAndRedraw"
    />
    <b-btn @click="toggleSmoothing">Smoothed</b-btn>
    <b-btn @click="setColourMap(0)">Viridis</b-btn>
    <b-btn @click="setColourMap(1)">Plasma</b-btn>
    <b-btn @click="setColourMap(2)">Inferno</b-btn>
    <b-btn @click="setColourMap(3)">Magma</b-btn>
    <b-btn @click="setColourMap(4)">Greyscale</b-btn>
    <b-btn @click="setColourMap(5)">Greyscale<sup>2</sup></b-btn>
    <b-btn v-if="hasBackgroundFrame">Show background</b-btn>
    <b-btn @click="incrementSpeed">{{ speedMultiplier }}x</b-btn>
    <b-btn @click="exportMp4">Export MP4</b-btn>
    <b-btn @click="play">Play</b-btn>
    <b-btn @click="pause">Pause</b-btn>
    <pre>{{ JSON.stringify(memory, null, "\t") }}</pre>
    <pre v-if="header">{{ headerInfo }}</pre>
  </div>
</template>

<script lang="ts">
import VideoTracksScrubber from "./VideoTracksScrubber.vue";
import CptvPlayer from "cptv_player_rs";
import { TagColours } from "@/const";

import viridis from "scale-color-perceptual/rgb/viridis.json";
import plasma from "scale-color-perceptual/rgb/plasma.json";
import magma from "scale-color-perceptual/rgb/magma.json";
import inferno from "scale-color-perceptual/rgb/inferno.json";

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
  Viridis,
  Plasma,
  Inferno,
  Magma,
  Greyscale,
  GreyscaleSquared,
];
const PlaybackSpeeds = [0.5, 1, 2, 4, 8];

const download = (url, filename) => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename || "download";
  anchor.click();
};

const mb = (size) => (size / 1024 / 1024).toFixed(2);

export default {
  name: "CptvPlayer",
  components: {
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
  },
  data() {
    return {
      colours: TagColours,
      canvasWidth: 800,
      canvasHeight: 600,
      isScrubbing: false,
      ended: false,
      header: null,
      frameHeader: null,
      smoothed: true,
      frameNum: 0,
      speedMultiplierIndex: 1,
      animationFrame: null,
      animationTick: 0,
      playing: false,
      wasPaused: true,
      totalFrames: false,
      colourMap: Viridis,
      memory: {
        jsHeapSizeLimit: mb(performance.memory.jsHeapSizeLimit),
        totalJSHeapSize: mb(performance.memory.totalJSHeapSize),
        usedJSHeapSize: mb(performance.memory.usedJSHeapSize),
      },
    };
  },
  created() {
    this.player = new CptvPlayer();
  },
  computed: {
    actualDuration() {
      if (this.totalFrames) {
        return this.adjustedTotalFrames / this.header.fps;
      }
      // Otherwise, best guess.
      return Math.max(
        ...this.tracks.map((track) => track.data.end_s),
        this.duration
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
    hasBackgroundFrame() {
      return this.header && this.header.has_background_frame;
    },
    duration() {
      return (this.recording && this.recording.duration) || 0;
    },
    currentTime() {
      if (this.header) {
        const totalTime = this.actualDuration;
        // TODO check whether the backend uses 8.7 or 9 as the fps when calculating duration.
        // Does the backend take the background_frame into account when setting duration?  Seems to.
        const totalFramesEstimate = this.actualDuration * this.header.fps;
        return (this.frameNum / totalFramesEstimate) * totalTime;
      }
      return 0;
    },
    secondsSinceLastFFC() {
      if (this.frameHeader && this.frameHeader.last_ffc_time) {
        return (
          (this.frameHeader.time_on - this.frameHeader.last_ffc_time) / 1000
        );
      }
      return 1000;
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
            "device name": h.device_name || "Unknown",
            "device ID": h.device_id || "Unknown",
            sensor: `${h.brand || "Unknown brand"} ${
              h.model || "Unknown model"
            }, serial #${h.serial_number}, firmware ${
              h.firmware_version || "Unknown"
            }`,
            "motion config":
              (h.motion_config &&
                h.motion_config.split("\n").reduce((acc, item) => {
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
          "\t"
        );
      } else {
        return null;
      }
    },
  },
  async mounted() {
    window.addEventListener("resize", this.onResize);
    this.setCanvasDimensions();
    const canvas = this.$refs.overlayCanvas;
    canvas.addEventListener("click", this.clickOverlayCanvas);
    canvas.addEventListener("mousemove", this.moveOverOverlayCanvas);
    await this.player.initWithCptvUrlAndSize(this.cptvUrl, this.cptvSize);
    this.header = await this.player.getHeader();
    this.$refs.canvas.width = this.header.width;
    this.$refs.canvas.height = this.header.height;
    await this.fetchRenderAdvanceFrame();
    this.updateMemoryStats = setInterval(() => {
      this.memory = {
        jsHeapSizeLimit: mb(performance.memory.jsHeapSizeLimit),
        totalJSHeapSize: mb(performance.memory.totalJSHeapSize),
        usedJSHeapSize: mb(performance.memory.usedJSHeapSize),
      };
    }, 1000);
    //this.renderCurrentFrame();
  },
  beforeDestroy() {
    const canvas = this.$refs.overlayCanvas;
    canvas.removeEventListener("click", this.clickOverlayCanvas);
    canvas.removeEventListener("mousemove", this.moveOverOverlayCanvas);
    window.removeEventListener("resize", this.onResize);
    clearInterval(this.updateMemoryStats);
  },
  watch: {
    async cptvUrl(url) {

      await this.player.initWithCptvUrlAndSize(url, this.cptvSize);
      this.header = await this.player.getHeader();
      this.$refs.canvas.width = this.header.width;
      this.$refs.canvas.height = this.header.height;
      this.frameNum = 0;
      this.totalFrames = false;
      cancelAnimationFrame(this.animationFrame);
      this.animationTick = 0;
      this.playing = false;
      this.wasPaused = true;
      await this.fetchRenderAdvanceFrame();
    },
  },
  methods: {
    async ensureEntireClipIsDecoded() {
      let frameNum = 0;
      while (!this.totalFrames) {
        await this.queueFrame(frameNum++);
      }
      if (this.totalFrames) {
        console.log("Entire clip decoded and ready for export", this.totalFrames, this.adjustedTotalFrames);
      }
      return true;
    },
    async clickOverlayCanvas(event) {
      const canvas = this.$refs.overlayCanvas;
      const canvasOffset = canvas.getBoundingClientRect();
      const x = event.x - canvasOffset.x;
      const y = event.y - canvasOffset.y;
      const hitRect = this.hitTestPos(x, y);
      if (hitRect) {
        const hitIndex = this.tracks.findIndex(
          (track) => track.trackIndex === hitRect.trackIndex
        );
        if (this.currentTrack.trackIndex !== hitIndex) {
          await this.renderCurrentFrame();
          this.$emit("trackSelected", hitIndex);
        }
      }
    },
    moveOverOverlayCanvas(event) {
      const canvas = this.$refs.overlayCanvas;
      const canvasOffset = canvas.getBoundingClientRect();
      const x = event.x - canvasOffset.x;
      const y = event.y - canvasOffset.y;
      const hitRect = this.hitTestPos(x, y);
      // set cursor
      canvas.style.cursor = hitRect !== null ? "pointer" : "default";
    },
    async setColourMap(index: number) {
      this.colourMap = ColourMaps[index];
      await this.renderCurrentFrame();
    },
    async fetchRenderAdvanceFrame() {
      // Fetch, render, advance
      const canAdvance = await this.renderCurrentFrame();
      if (canAdvance) {
        this.frameNum++;
      } else if (this.playing) {
        this.pause();
      }
    },
    async exportMp4() {
      this.pause();
      // TODO(jon): Better to do this in a web-worker so that we don't block the main thread.
      // Also warn users not to navigate away from the page while it's encoding.
      const HME = await import("h264-mp4-encoder");
      const encoder = await HME.createH264MP4Encoder();
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
      await this.ensureEntireClipIsDecoded();
      encoder.initialize();
      let frameNum = 0;

      // TODO(jon): Show a popup that shows encoding progress
      console.assert(this.totalFrames !== false);
      while (frameNum < this.adjustedTotalFrames) {
        const { frameData } = await this.queueFrame(frameNum);
        const imgData = this.getCurrentFrameData(videoContext, frameData);
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
        const totalTime = this.actualDuration;
        const totalFrames = this.adjustedTotalFrames;
        const timeAtFrameNum = (frameNum / totalFrames) * totalTime;
        const frameHeader = this.player.getFrameHeaderAtIndex(frameNum);
        let timeSinceLastFFCSeconds = Number.MAX_SAFE_INTEGER;
        if (frameHeader.last_ffc_time) {
          timeSinceLastFFCSeconds =
            (frameHeader.time_on - frameHeader.last_ffc_time) / 1000;
        }
        this.renderOverlay(
          context,
          timeAtFrameNum,
          false,
          renderCanvas.width / videoCanvas.width,
          timeSinceLastFFCSeconds,
          true
        );

        encoder.addFrameRgba(
          context.getImageData(0, 0, encoder.width, encoder.height).data
        );
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
    },
    getCurrentFrameData(context: CanvasRenderingContext2D, frame) {
      const { min, max, data: frameData } = frame;
      const imgData = context.getImageData(
        0,
        0,
        context.canvas.width,
        context.canvas.height
      );
      const data = new Uint32Array(imgData.data.buffer);
      const colourMap = this.colourMap;
      const range = max - min;
      for (let i = 0; i < data.length; i++) {
        const index = ((frameData[i] - min) / range) * 255.0;
        const indexUpper = Math.ceil(index);
        //const indexLower = Math.floor(index);
        // TODO(jon): Interpolate between these steps?
        data[i] = colourMap[indexUpper];
      }
      return imgData;
    },
    renderFrame(frameData, frameNum) {
      const context = this.$refs.canvas.getContext("2d");
      const imgData = this.getCurrentFrameData(context, frameData);
      this.frameHeader = this.player.getFrameHeaderAtIndex(frameNum);
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = requestAnimationFrame(() =>
        this.drawFrame(context, imgData)
      );
    },
    async queueFrame(frameNum: number) {
      let frameData = this.player.getFrameAtIndex(frameNum);
      if (frameData) {
        return { frameNum, frameData };
      } else {
        await this.player.seekToFrame(frameNum);
      }
      frameData = this.player.getFrameAtIndex(frameNum);
      if (frameData === false) {
        console.assert(this.player.getTotalFrames() !== false);
        this.totalFrames = this.player.getTotalFrames();
        frameNum = this.adjustedTotalFrames - 1;
        frameData = this.player.getFrameAtIndex(frameNum);
        console.assert(frameData !== false);
      }
      return { frameNum, frameData };
    },
    async drawFrame(context, imgData) {
      // TODO(jon): respect fps here, render only when we should.
      this.animationTick++;
      const everyXTicks = Math.max(
        1,
        60 / (this.header.fps * this.speedMultiplier)
      );
      const shouldRedraw = Math.floor(this.animationTick % everyXTicks) === 0;
      if (shouldRedraw) {
        context.putImageData(imgData, 0, 0);
        if (this.playing) {
          await this.fetchRenderAdvanceFrame();
        }
        this.renderOverlay(
          this.$refs.overlayCanvas.getContext("2d"),
          this.currentTime,
          true,
          this.scale,
          this.secondsSinceLastFFC,
          false
        );
      } else {
        this.animationFrame = requestAnimationFrame(() =>
          this.drawFrame(context, imgData)
        );
      }
    },
    incrementSpeed() {
      this.speedMultiplierIndex++;
      if (this.speedMultiplierIndex === PlaybackSpeeds.length) {
        this.speedMultiplierIndex = 0;
      }
    },
    renderOverlay(
      context: CanvasRenderingContext2D,
      atTime: number,
      clear: boolean,
      scale: number,
      timeSinceFFCSeconds: number,
      isExporting: boolean
    ) {
      if (clear) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      }
      const data = this.getVideoFrameDataForAllTracksAtTime(
        atTime,
        false,
        scale
      );
      for (const rect of data) {
        this.drawRectWithText(context, rect, isExporting);
      }
      if (timeSinceFFCSeconds < 10) {
        context.font = "bold 15px Verdana";
        let a = 1 / (10 - timeSinceFFCSeconds);
        a = a * a;
        const alpha = 1 - a;
        context.fillStyle = `rgba(163, 210, 226, ${alpha})`;
        // TODO(jon): Make opacity of text stronger when the FFC event has just happened
        const text = "Calibrating...";
        const textWidth = context.measureText(text).width;
        const textX = (context.canvas.width / window.devicePixelRatio) / 2 - textWidth / 2;
        const textY = 20;
        context.fillText(text, textX, textY);
      }
    },
    drawRectWithText(
      context: CanvasRenderingContext2D,
      { trackIndex, rectWidth, rectHeight, x, y },
      isExporting: boolean
    ) {
      const hitIndex = this.tracks.findIndex(
        (track) => track.trackIndex === trackIndex
      );
      context.strokeStyle = this.colours[hitIndex % this.colours.length];
      const selected = this.currentTrack.trackIndex === hitIndex;
      const lineWidth = selected ? 2 : 1;
      const halfLineWidth = lineWidth / 2;
      context.lineWidth = lineWidth;
      //console.log(x, y);
      context.beginPath();
      if (lineWidth === 2) {
        context.strokeRect(
          Math.round(x) - halfLineWidth,
          Math.round(y) - halfLineWidth,
          Math.round(rectWidth) + halfLineWidth,
          Math.round(rectHeight) + halfLineWidth
        );
      } else {
        context.strokeRect(
          Math.round(x) + 0.5 - halfLineWidth,
          Math.round(y) + 0.5 - halfLineWidth,
          Math.round(rectWidth) - 0.5 + halfLineWidth,
          Math.round(rectHeight) - 0.5 + halfLineWidth
        );
      }

      if (selected || isExporting) {
        context.font = "12px Verdana";
        context.fillStyle = "white";

        const track = this.tracks.find(
          (track) => track.trackIndex === trackIndex
        );
        let aiTag = "";
        if (track) {
          const tag = track.TrackTags.find(
            (tag) =>
              (tag.data && tag.data === "Master") || tag.data.name === "Master"
          );
          if (tag) {
            aiTag = tag.what;
          }
        }
        // If exporting, show all the best guess animal tags, if not unknown
        const text = isExporting
          ? aiTag
          : `Track ${hitIndex + 1}${aiTag ? `(${aiTag})` : ""}`;
        if (text !== "") {
          const textHeight = 12;
          const textWidth = context.measureText(text).width;

          // TODO Determine if the box can be shown right at the bottom of the screen
          // if it can then we probably need to detect this and display the text above
          // or inside the box.
          const textX = x + (rectWidth - textWidth);
          const textY = y + (rectHeight + textHeight);
          context.fillText(text, textX, textY);
        }
      }
    },
    toggleSmoothing() {
      this.smoothed = !this.smoothed;
    },
    // totalFrames() {
    //   let adjust = 0;
    //   if (this.hasBackgroundFrame) {
    //     adjust = -1;
    //   }
    //   let totalFrames = this.player.getTotalFrames();
    //   if (totalFrames !== false) {
    //     totalFrames += adjust;
    //   } else {
    //     totalFrames = this.actualDuration * this.header.fps;
    //   }
    //   return totalFrames;
    // },
    hitTestPos(x, y) {
      const allFrameData = this.getVideoFrameDataForAllTracksAtTime(
        this.currentTime,
        this.showOverlaysForCurrentTrackOnly,
        this.scale
      );
      for (const rect of allFrameData) {
        if (
          rect.x <= x &&
          rect.x + rect.rectWidth > x &&
          rect.y <= y &&
          rect.y + rect.rectHeight > y
        ) {
          return rect;
        }
      }
      return null;
    },
    onResize() {
      this.setCanvasDimensions();
    },
    getVideoFrameDataForAllTracksAtTime(
      currentTime: number,
      currentTrackOnly: boolean,
      scale: number
    ) {
      const search = (positions, currentTime) => {
        let i = positions.length - 1;
        while (positions[i] && positions[i][0] > currentTime) {
          i--;
        }
        i = Math.max(0, i);
        return positions[i];
      };
      // First check if the last position we got is still the current position?
      // See if tracks are in range.
      let tracks;
      if (currentTrackOnly) {
        if (this.tracks.length && this.tracks[this.currentTrack.trackIndex]) {
          tracks = [this.tracks[this.currentTrack.trackIndex]];
        } else {
          tracks = [];
        }
      } else {
        tracks = this.tracks;
      }
      return tracks
        .filter(
          ({ data: { start_s, end_s } }) =>
            start_s <= currentTime && end_s >= currentTime
        )
        .map(({ data: { positions }, trackIndex }) => {
          const item = search(positions, currentTime)[1];
          return {
            rectWidth: (item[2] - item[0]) * scale,
            rectHeight: (item[3] - item[1]) * scale,
            x: item[0] * scale,
            y: item[1] * scale,
            trackIndex,
          };
        });
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
      this.$refs.container.style.minHeight = `${this.canvasHeight}px`;
      context.scale(devicePixelRatio, devicePixelRatio);
    },
    async setTimeAndRedraw(time) {
      let totalFrames = this.totalFrames;
      if (totalFrames === false) {
        totalFrames = Math.floor(this.actualDuration * this.header.fps);
      }
      this.frameNum = Math.floor(
        Math.min(totalFrames - 1, (time / this.actualDuration) * totalFrames)
      );
      await this.renderCurrentFrame();
    },
    async renderCurrentFrame(frameNum?: number) {
      if (frameNum === undefined) {
        frameNum = this.frameNum;
      }
      const { frameNum: actualFrameNum, frameData } = await this.queueFrame(
        frameNum
      );
      this.renderFrame(frameData, actualFrameNum);
      return frameNum === actualFrameNum;
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
    pause() {
      this.playing = false;
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
</style>
