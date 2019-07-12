<template>
  <div
    ref="container"
    class="video-container">
    <canvas
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      class="canvas"/>
    <video-player
      ref="player"
      :key="videoUrl"
      :options="playerOptions"
      class="video vjs-custom-skin"
      @seeking="seeking"
      @play="draw"
      @ready="selectTrack"/>
  </div>
</template>

<script>
import {videoPlayer} from 'vue-video-player';

export default {
  name: 'ThermalVideoPlayer',
  components: {
    videoPlayer
  },
  props: {
    videoUrl: {
      type: String,
      required: true,
    },
    tracks: {
      type: Array,
      required: true,
    },
    currentTrack: {
      type: Number,
      default: 0,
    },
    colours: {
      type: Array,
      required: true,
    }
  },
  data () {
    return {
      lastDisplayedVideoTime: 0,
      currentVideoTime: 0,
      lastTrackFrame: 0,
      playerOptions: {
        autoplay: true,
        muted: true,
        width: '720px',
        playbackRates: [0.5, 1, 2, 4, 8],
        inactivityTimeout: 0,
        sources: [{
          type: "video/mp4",
          src: "blah blah",
        }],
      },
      canvasWidth: 800,
      canvasHeight: 600,
      scale: 5,
    };
  },
  watch: {
    videoUrl: function () {
      this.setVideoUrl();
    },
    currentTrack: function() {
      this.selectTrack();
    },
    tracks: function() {
      this.selectTrack();
    }
  },
  mounted: function () {
    this.calculateSizes();
    this.setVideoUrl();
    window.addEventListener('resize', this.onResize);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    setVideoUrl() {
      // first must make sure the width to be loaded is also correct.
      this.playerOptions.width = this.canvasWidth + "px";
      this.playerOptions.height = this.canvasHeight + "px";
      this.$data.playerOptions.sources[0].src = this.videoUrl;
      // if tracks is loaded then select the first track
      this.currentTrack = 0;
    },
    selectTrack() {
      this.lastDisplayedVideoTime = -1;
      if (this.tracks && this.currentTrack < this.tracks.length) {
        this.setTimeAndRedraw(this.tracks[this.currentTrack].data.start_s + .01);
      }
    },
    onResize() {
      const oldWidth = this.canvasWidth;
      this.calculateSizes();
      if (oldWidth != this.canvasWidth) {
        this.currentVideoTime += 10;
        this.draw(true);
      }
    },
    calculateSizes() {
      this.canvasWidth = this.$refs.canvas.clientWidth;
      this.scale = this.canvasWidth /160;
      this.canvasHeight = (this.scale * 120) + 30;
      this.$refs.player.player.width(this.canvasWidth);
      this.$refs.player.player.height(this.canvasHeight);
    },
    setTimeAndRedraw(time) {
      this.lastTrackFrame = 0;
      this.$refs.player.player.currentTime(time);
    },
    seeking(event) {
      // If the user is moving the time slider on the video then update the canvas
      // as well so that it matches the underlying video frame.
      if(event.type === "seeking") {
        this.lastTrackFrame = 0;
        this.draw();
      }
    },
    displayText(context, text, rectWidth, rectHeight) {
      context.font = '12px Verdana';
      context.fillStyle = 'white';

      const textHeight = 12;
      const textWidth = context.measureText(text).width;

      // TODO Determine if the box can be shown right at the bottom of the screen
      // if it can then we probably need to detect this and display the text above
      // or inside the box.
      const x = rectWidth - textWidth;
      const y = rectHeight + textHeight;
      context.fillText(text, x, y);
    },
    displayBox(context, width, height) {
      context.beginPath();
      context.rect(-2, -2, width + 2, height + 2);
      context.strokeStyle = this.colours[this.currentTrack % this.colours.length];
      context.lineWidth = 3;
      context.stroke();
    },
    getCurrentVideoFrameData(currentTime) {
      if (!this.tracks || this.tracks.length == 0) {
        return {rectWidth: 0, rectHeight: 0, x: 0, y: 0, text:""};
      }

      const trackPos = this.tracks[this.currentTrack].data.positions;
      if (currentTime < trackPos[this.lastTrackFrame][0]) {
        this.lastTrackFrame = 0;
      }

      for (let i = this.lastTrackFrame + 1; i < trackPos.length; i++) {
        if (currentTime > trackPos[i][0]) {
          this.lastTrackFrame = i;
        } else {
          break;
        }
      }

      if (this.lastTrackFrame == 0 && currentTime < trackPos[0][0]) {
        return {rectWidth: 0, rectHeight: 0, x: 0, y: 0, text:""};
      }

      if (this.lastTrackFrame == trackPos.length - 1 && currentTime > trackPos[this.lastTrackFrame][0] + 0.112) {
        return {rectWidth: 0, rectHeight: 0, x: 0, y: 0, text:""};
      }
      const rect = trackPos[this.lastTrackFrame][1];
      const rectWidth = rect[2] - rect[0];
      const rectHeight = rect[3] - rect[1];
      const x = rect[0];
      const y = rect[1];
      const text = `Track ${this.currentTrack + 1}`;

      return {rectWidth, rectHeight, x, y, text};
    },
    shouldDraw() {
      const v = this.$refs.player;
      if (v === undefined || v.paused || v.ended) {
        return false;
      }
      this.draw(false);
    },
    draw(mustRedraw) {
      const v = this.$refs.player;
      this.currentVideoTime = v.player.currentTime();

      // Only update the canvas if the video time has changed as this means a new
      // video frame is being displayed.
      if (mustRedraw || (v.player.currentTime() !== this.lastDisplayedVideoTime)) {
        const frameData = this.getCurrentVideoFrameData(v.player.currentTime());

        const canvas = this.$refs.canvas;
        const context = canvas.getContext('2d');
        const ss = this.scale;

        // Clear the canvas before each new frame
        context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Translate the context so the top left corner of the rectangle is always (0,0)
        context.save();
        if (frameData) {
          context.translate(frameData.x * ss, frameData.y * ss);
          this.displayBox(context, frameData.rectWidth * ss, frameData.rectHeight * ss);
          this.displayText(context, frameData.text, frameData.rectWidth * ss, frameData.rectHeight * ss);
        }
        context.restore();

        this.lastDisplayedVideoTime = v.player.currentTime();
      }
      requestAnimationFrame(this.shouldDraw);
    },
  },
};
</script>

<style>
  .video {
    min-width: 100%;
    max-width: 100%;
    height: auto;
  }

  .vjs-big-play-button, .vjs-control-bar {
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
  }

</style>
<style src="video.js/dist/video-js.css"></style>