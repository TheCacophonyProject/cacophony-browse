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
    <pre v-if="header">{{ headerInfo }}</pre>
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
      colourMap: Viridis,
    };
  },
  created() {
    this.player = new CptvPlayer();
  },
  computed: {
    actualDuration() {
      return Math.max(
        ...this.tracks.map((track) => track.data.end_s),
        this.duration
      );
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
    await this.player.initWithCptvUrl(this.cptvUrl);
    this.header = await this.player.getHeader();
    this.$refs.canvas.width = this.header.width;
    this.$refs.canvas.height = this.header.height;
    await this.renderFrame();
    //await this.seekToFrame(1150);
    //this.renderCurrentFrame();
  },
  beforeDestroy() {
    const canvas = this.$refs.overlayCanvas;
    canvas.removeEventListener("click", this.clickOverlayCanvas);
    canvas.removeEventListener("mousemove", this.moveOverOverlayCanvas);
    window.removeEventListener("resize", this.onResize);
  },
  watch: {
    async cptvUrl(url) {
      await this.player.initWithCptvUrl(url);
      this.header = await this.player.getHeader();
      this.$refs.canvas.width = this.header.width;
      this.$refs.canvas.height = this.header.height;
      this.frameNum = 0;
      await this.renderFrame();
      //await this.player.play(this.onFrame);
    },
  },
  methods: {
    async ensureEntireClipIsDecoded() {
      while (!this.player.atEndOfVideo()) {
        const streamLoading = await this.player.fetchRawFrame();
        if (!streamLoading) {
          break;
        }
      }
      return true;
    },
    clickOverlayCanvas(event) {
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
          this.renderCurrentFrame();
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
    setColourMap(index: number) {
      this.colourMap = ColourMaps[index];
      this.renderCurrentFrame();
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
      await this.ensureEntireClipIsDecoded();
      await this.seekToFrame(0);
      encoder.initialize();
      let frameNum = 0;

      // TODO(jon): Show a popup that shows encoding progress
      while (!this.player.atEndOfVideo()) {
        const imgData = this.getCurrentFrameData(videoContext);
        videoContext.putImageData(imgData, 0, 0);
        // FIXME(jon): We may be getting an additional duplicate frame at the end of the video.
        // Maybe just have an API for getting the last frame num
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
        // TODO check whether the backend uses 8.7 or 9 as the fps when calculating duration.
        // Does the backend take the background_frame into account when setting duration?  Seems to.
        const totalFramesEstimate = this.actualDuration * this.header.fps;
        // TODO adjust for background frame.
        const timeAtFrameNum = (frameNum / totalFramesEstimate) * totalTime;
        const frameHeader = this.player.getFrameHeader();
        let duringFFC = false;
        if (frameHeader.last_ffc_time) {
          duringFFC =
            (frameHeader.time_on - frameHeader.last_ffc_time) / 1000 < 5;
        }
        this.renderOverlay(
          context,
          timeAtFrameNum,
          false,
          renderCanvas.width / videoCanvas.width,
          duringFFC,
          true
        );

        encoder.addFrameRgba(
          context.getImageData(0, 0, encoder.width, encoder.height).data
        );
        await this.player.seekToFrame(frameNum++);
      }
      // Add a single gray frame, the alpha is ignored.
      //encoder.addFrameRgba(new Uint8Array(encoder.width * encoder.height * 4).fill(128))
      // For canvas:
      // encoder.addFrameRgba(ctx.getImageData(0, 0, encoder.width * encoder.height).data);
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
    getCurrentFrameData(context: CanvasRenderingContext2D) {
      const { min, max, data: frameData } = this.player.getCurrentFrame();
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
    renderCurrentFrame() {
      const context = this.$refs.canvas.getContext("2d");
      const imgData = this.getCurrentFrameData(context);
      this.frameHeader = this.player.getFrameHeader();
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = requestAnimationFrame(() =>
        this.drawFrame(context, imgData)
      );
    },
    async renderFrame() {
      await this.player.advanceToNextFrame();
      this.renderCurrentFrame();
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
        const atLastFrameOfVideo = this.player.atEndOfVideo();
        if (this.playing && !atLastFrameOfVideo) {
          this.frameNum++;
          await this.renderFrame();
        } else if (atLastFrameOfVideo) {
          this.pause();
        }
        this.renderOverlay(
          this.$refs.overlayCanvas.getContext("2d"),
          this.currentTime,
          true,
          this.scale,
          this.secondsSinceLastFFC < 5,
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
      duringFFC: boolean,
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
      if (duringFFC) {
        context.font = "12px Verdana";
        context.fillStyle = "white";
        const text = "Calibrating...";
        const textWidth = context.measureText(text).width;
        const textX = context.canvas.width / 2 - textWidth;
        const textY = 20;
        context.fillText(text, textX, textY);
      }
    },
    async seekToFrame(frameNum) {
      cancelAnimationFrame(this.animationFrame);
      await this.player.seekToFrame(frameNum);
      this.frameNum = this.player.getFrameNum();
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
          const tag = track.TrackTags.find((tag) => tag.data === "Master" || tag.data.name === "Master");
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
      const totalFramesEstimate = this.actualDuration * this.header.fps;
      const frameNum = (time / this.actualDuration) * totalFramesEstimate;
      await this.seekToFrame(frameNum);
      this.renderCurrentFrame();
    },
    startScrub() {
      // this.wasPaused = this.htmlPlayer.paused;
      // if (!this.wasPaused) {
      //   this.videoJsPlayer().pause();
      // }
      console.log("Start scrub");
      this.isScrubbing = true;
    },
    endScrub() {
      // if (!this.wasPaused) {
      //   this.videoJsPlayer().play();
      // }
      console.log("End scrub");
      this.isScrubbing = false;
    },
    async play() {
      this.playing = true;
      if (this.player.atEndOfVideo()) {
        await this.seekToFrame(0);
      }
      this.renderCurrentFrame();
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
