<template>
  <div
    ref="container"
    class="container">
    <canvas
      ref="canvas"
      class="canvas"/>
    <video-player
      ref="player"
      :key="videoUrl"
      :options="playerOptions"
      height="auto"
      class="video vjs-custom-skin"
      @seeking="seeking"
      @play="draw"/>
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
    }
  },
  data () {
    return {
      lastDisplayedVideoTime: 0,
      currentVideoTime: 0,
      lastTrackFrame: 0,
      scale: 4,
      playerOptions: {
        autoplay: false,
        muted: true,
        width: '640px',
        playbackRates: [0.5, 1, 2, 4, 8],
        sources: [{
          type: "video/mp4",
          src: "blah blah",
        }],
      }
    };
  },
  watch: {
    videoUrl: function (newValue) {
      this.$data.playerOptions.sources[0].src = newValue;
    },
  },
  mounted: function () {
    this.$data.playerOptions.sources[0].src = this.videoUrl;
  },
  methods: {
    seeking(event) {
      // If the user is moving the time slider on the video then update the canvas
      // as well so that it matches the underlying video frame.
      if(event.type === "seeking") {
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
      context.rect(0, 0, width, height);
      context.strokeStyle = 'yellow';
      context.stroke();
    },
    getCurrentVideoFrameData(currentTime) {
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
      const text = 'Possum';

      return {rectWidth, rectHeight, x, y, text};
    },
    shouldDraw() {
      const v = this.$refs.player;
      if (v === undefined || v.paused || v.ended) {
        return false;
      }
      this.draw();
    },
    draw() {
      const v = this.$refs.player;
      this.currentVideoTime = v.player.currentTime();

      // Only update the canvas if the video time has changed as this means a new
      // video frame is being displayed.
      if (v.player.currentTime() !== this.lastDisplayedVideoTime) {
        const frameData = this.getCurrentVideoFrameData(v.player.currentTime());

        const canvas = this.$refs.canvas;
        const context = canvas.getContext('2d');

        const container = this.$refs.container;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        const ss = 4;

        // Clear the canvas before each new frame
        context.clearRect(0, 0, canvas.width, canvas.height);

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

  .vjs-big-play-button {
    z-index: 1000;
  }

  .vjs-control-bar {
    z-index: 1000;
  }

  .video .video-js .vjs-volume-panel,
  .video .video-js .vjs-fullscreen-control {
    display: none;
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
    z-index: 999;
  }

  .container {
    position: relative;
    width: 100%;
    padding: 0;
  }

</style>
