<template>
  <div 
    ref="container" 
    class="video-container">
    <canvas
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      class="canvas"
    />
    <video-player
      ref="player"
      :key="videoUrl"
      :options="playerOptions"
      class="video vjs-custom-skin"
      @seeking="seeking"
      @play="draw"
      @statechanged="stateChange"
      @ready="playerReady"
    />
    <VideoTracksScrubber
      ref="scrubber"
      :duration="duration"
      :tracks="tracks"
      :current-video-time="currentVideoTime"
      :colours="colours"
      :canvas-width="canvasWidth"
      @start-scrub="startScrub"
      @end-scrub="endScrub"
      @set-playback-time="setTimeAndRedraw"
    />
  </div>
</template>

<script>
import { videoPlayer } from "vue-video-player";
import VideoTracksScrubber from "./VideoTracksScrubber.vue";

export default {
  name: "ThermalVideoPlayer",
  components: {
    videoPlayer,
    VideoTracksScrubber
  },
  props: {
    videoUrl: {
      type: String,
      required: true
    },
    tracks: {
      type: Array,
      required: true
    },
    currentTrack: {
      type: Number,
      default: 0
    },
    colours: {
      type: Array,
      required: true
    }
  },
  data() {
    // Seems like we should wait until track data and video data has loaded to play video?
    return {
      lastDisplayedVideoTime: 0,
      currentVideoTime: 0,
      duration: 0,
      playerOptions: {
        autoplay: true,
        muted: true,
        width: "720px",
        playbackRates: [0.5, 1, 2, 4, 8],
        inactivityTimeout: 0,
        sources: [
          {
            type: "video/mp4",
            src: "blah blah"
          }
        ]
      },
      canvasWidth: 800,
      canvasHeight: 600,
      scale: 5,
      wasPaused: false,
      isScrubbing: false,
      initedTrackHitRegions: false
    };
  },
  watch: {
    videoUrl: function() {
      this.setVideoUrl();
    },
    currentTrack: function() {
      this.selectTrack();
    },
    tracks: function(tracks) {
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].trackIndex = i;
      }
      this.selectTrack();
    }
  },
  mounted: function() {
    this.initOverlayCanvas();
    this.setVideoUrl();
    window.addEventListener("resize", this.onResize);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    bindRateChange() {
      const htmlPlayer = this.$refs.player.$refs.video;
      const rate = localStorage.getItem("playbackrate");
      if (rate) {
        htmlPlayer.playbackRate = rate;
      }
      htmlPlayer.onratechange = this.ratechange;
    },
    startScrub() {
      const player = this.$refs.player;
      const htmlPlayer = player.$refs.video;
      this.wasPaused = htmlPlayer.paused;
      if (!this.wasPaused) {
        player.player.pause();
      }
      this.isScrubbing = true;
    },
    endScrub() {
      if (!this.wasPaused) {
        this.$refs.player.player.play();
      }
      this.isScrubbing = false;
    },
    stateChange(event) {
      if (event.hasOwnProperty("canplay") && event.canplay) {
        // Try to get the video length:
        this.duration = document.getElementsByTagName("video")[0].duration;
      }
    },
    setVideoUrl() {
      // first must make sure the width to be loaded is also correct.
      this.playerOptions.width = this.canvasWidth + "px";
      this.playerOptions.height = this.canvasHeight + "px";
      this.$data.playerOptions.sources[0].src = this.videoUrl;
      // if tracks is loaded then select the first track
      this.currentTrack = 0;
    },
    playerReady() {
      this.bindRateChange();
      this.selectTrack();
    },
    selectTrack() {
      this.lastDisplayedVideoTime = -1;
      if (this.tracks && this.currentTrack < this.tracks.length) {
        this.setTimeAndRedraw(
          this.tracks[this.currentTrack].data.start_s + 0.01
        );
      }
    },
    onResize() {
      const oldWidth = this.canvasWidth;
      this.initOverlayCanvas();
      if (oldWidth !== this.canvasWidth) {
        this.currentVideoTime += 10;
        this.draw();
      }
    },
    initOverlayCanvas() {
      this.canvasWidth = this.$refs.container.clientWidth;
      this.scale = this.canvasWidth / 160;
      this.canvasHeight = this.scale * 120 + 30;
      this.$refs.player.player.width(this.canvasWidth);
      this.$refs.player.player.height(this.canvasHeight);

      // Make canvas be sharp on retina displays:
      const canvas = this.$refs.canvas;
      const context = canvas.getContext("2d");
      const devicePixelRatio = window.devicePixelRatio;
      canvas.width = this.canvasWidth * devicePixelRatio;
      canvas.height = this.canvasHeight * devicePixelRatio;
      canvas.style.width = `${this.canvasWidth}px`;
      canvas.style.height = `${this.canvasHeight}px`;
      context.scale(devicePixelRatio, devicePixelRatio);

      if (this.$refs.scrubber) {
        this.$refs.scrubber.$el.style.width = canvas.style.width;
      }

      if (!this.initedTrackHitRegions) {
        this.initedTrackHitRegions = true;
        // Hit-testing of track rects, so they are clickable.
        const hitTestPos = (x, y) => {
          const allFrameData = this.getVideoFrameDataForAllTracksAtTime(
            this.currentVideoTime
          );
          for (const rect of allFrameData) {
            if (
              rect.x <= x &&
              rect.x + rect.rectWidth > x &&
              (rect.y <= y && rect.y + rect.rectHeight > y)
            ) {
              return rect;
            }
          }
          return null;
        };

        canvas.addEventListener(
          "click",
          function(event) {
            const canvasOffset = canvas.getBoundingClientRect();
            const x = event.x - canvasOffset.x;
            const y = event.y - canvasOffset.y;
            const hitRect = hitTestPos(x, y);
            if (hitRect) {
              this.$emit("trackSelected", hitRect.trackIndex);
            }
          }.bind(this)
        );

        canvas.addEventListener("mousemove", event => {
          const canvasOffset = canvas.getBoundingClientRect();
          const x = event.x - canvasOffset.x;
          const y = event.y - canvasOffset.y;
          const hitRect = hitTestPos(x, y);
          // set cursor
          canvas.style.cursor = hitRect !== null ? "pointer" : "default";
        });
      }
    },
    setTimeAndRedraw(time) {
      this.$refs.player.player.currentTime(time);
    },
    ratechange() {
      if (this.$refs.player != undefined) {
        const htmlPlayer = this.$refs.player.$refs.video;
        localStorage.setItem("playbackrate", htmlPlayer.playbackRate);
      }
    },
    seeking(event) {
      // If the user is moving the time slider on the video then update the canvas
      // as well so that it matches the underlying video frame.
      if (event.type === "seeking") {
        this.draw();
      }
    },
    drawRectWithText(context, { trackIndex, rectWidth, rectHeight, x, y }) {
      context.strokeStyle = this.colours[trackIndex % this.colours.length];
      const lineWidth = trackIndex === this.currentTrack ? 3 : 1;
      const halfLineWidth = lineWidth / 2;
      context.lineWidth = lineWidth;
      context.strokeRect(
        x - halfLineWidth,
        y - halfLineWidth,
        rectWidth + halfLineWidth,
        rectHeight + halfLineWidth
      );
      const selected = trackIndex === this.currentTrack;
      if (selected) {
        context.font = "12px Verdana";
        context.fillStyle = "white";
        const text = `Track ${trackIndex + 1}`;
        const textHeight = 12;
        const textWidth = context.measureText(text).width;

        // TODO Determine if the box can be shown right at the bottom of the screen
        // if it can then we probably need to detect this and display the text above
        // or inside the box.
        const textX = x + (rectWidth - textWidth);
        const textY = y + (rectHeight + textHeight);
        context.fillText(text, textX, textY);
      }
    },
    getVideoFrameDataForAllTracksAtTime(currentTime) {
      const search = (positions, currentTime) => {
        let i = positions.length - 1;
        while (positions[i][0] > currentTime) {
          i--;
        }
        return positions[i];
      };
      // First check if the last position we got is still the current position?
      // See if tracks are in range.
      return this.tracks
        .filter(
          ({ data: { start_s, end_s } }) =>
            start_s <= currentTime && end_s >= currentTime
        )
        .map(({ data: { positions }, trackIndex }) => {
          const item = search(positions, currentTime)[1];
          return {
            rectWidth: (item[2] - item[0]) * this.scale,
            rectHeight: (item[3] - item[1]) * this.scale,
            x: item[0] * this.scale,
            y: item[1] * this.scale,
            trackIndex
          };
        });
    },
    draw() {
      if (this.$refs.player) {
        const v = this.$refs.player;
        // NOTE: Since our video is 9fps, we're don't need to update this at 60fps.
        const frameTime = 1 / 9;
        this.currentVideoTime = v.player.currentTime();
        const currentFrame = Math.floor(this.currentVideoTime / frameTime);
        if (currentFrame !== this.lastDisplayedVideoTime || this.isScrubbing) {
          // Only update the canvas if the video time has changed as this means a new
          // video frame is being displayed.
          const allFrameData = this.getVideoFrameDataForAllTracksAtTime(
            this.currentVideoTime
          );
          const canvas = this.$refs.canvas;
          const context = canvas.getContext("2d");
          const devicePixelRatio = window.devicePixelRatio;
          canvas.width = this.canvasWidth * devicePixelRatio;
          canvas.height = this.canvasHeight * devicePixelRatio;

          canvas.style.width = `${this.canvasWidth}px`;
          canvas.style.height = `${this.canvasHeight}px`;
          if (this.$refs.scrubber) {
            this.$refs.scrubber.$el.style.width = canvas.style.width;
          }
          context.scale(devicePixelRatio, devicePixelRatio);

          // Clear the canvas before each new frame
          context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
          if (allFrameData.length) {
            for (const rect of allFrameData) {
              this.drawRectWithText(context, rect);
            }
          }
          this.lastDisplayedVideoTime = currentFrame;
        }
        requestAnimationFrame(this.draw);
      }
    }
  }
};
</script>

<style>
.video {
  min-width: 100%;
  max-width: 100%;
  height: auto;
}

.vjs-big-play-button,
.vjs-control-bar {
  z-index: 990;
}

.video .video-js .vjs-volume-panel,
.video .video-js .vjs-fullscreen-control {
  display: none;
}

.video .video-js .vjs-tech {
  margin-top: -15px;
}

.audio {
  display: block;
  min-width: 100%;
  max-width: 100%;
}

.canvas {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  z-index: 900;
}

.video-container {
  margin: 0 auto;
  position: relative;
  width: 100%;
  padding: 0;
}
</style>
<style src="video.js/dist/video-js.css">
</style>
