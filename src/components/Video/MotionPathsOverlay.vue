<template>
  <canvas
    ref="canvas"
    :key="'motionPaths'"
    :width="canvasWidth"
    :height="canvasHeight"
    :class="{ 'ended-playback': endedPlayback }"
  />
</template>

<script>
import { TagColours } from "../../const";

export default {
  name: "MotionPathsOverlay",
  props: {
    canvasWidth: {
      type: Number,
      required: true,
    },
    canvasHeight: {
      type: Number,
      required: true,
    },
    endedPlayback: {
      type: Boolean,
      required: true,
    },
    tracks: {
      type: Array,
      required: true,
    },
    scale: {
      type: Number,
      required: true,
    },
    currentTrack: {
      type: Number,
      required: true,
    },
    showOnlyForCurrentTrack: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      colours: TagColours,
    };
  },
  mounted() {
    this.drawPaths();
  },
  beforeDestroy() {
    this.clearPaths();
  },
  methods: {
    drawPaths() {
      this.clearPaths();
      const canvas = this.$refs.canvas;
      if (canvas) {
        const context = canvas.getContext("2d");
        const devicePixelRatio = window.devicePixelRatio;
        canvas.width = this.canvasWidth * devicePixelRatio;
        canvas.height = this.canvasHeight * devicePixelRatio;
        canvas.style.width = `${this.canvasWidth}px`;
        canvas.style.height = `${this.canvasHeight}px`;
        context.save();
        context.scale(devicePixelRatio, devicePixelRatio);

        // Draw track trails:
        let num = 0;
        let tracks = this.tracks;
        if (this.showOnlyForCurrentTrack) {
          tracks = [this.tracks[this.currentTrack]];
        }
        for (const { data } of tracks) {
          context.strokeStyle = this.colours[num % this.colours.length];
          context.lineWidth = 3 / devicePixelRatio;
          context.lineJoin = "round";
          context.lineCap = "round";
          context.beginPath();
          let l = 0;
          for (const position of data.positions) {
            const p = position[1];
            const x = (p[0] + (p[2] - p[0]) * 0.5) * this.scale;
            const y = (p[1] + (p[3] - p[1]) * 0.5) * this.scale;
            if (l === 0) {
              context.moveTo(x, y);
            } else {
              context.lineTo(x, y);
            }
            l++;
          }
          context.stroke();
          num++;
        }
        context.restore();
      }
    },
    clearPaths() {
      const canvas = this.$refs.canvas;
      if (canvas) {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      }
    },
  },
};
</script>

<style scoped>
canvas {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 800;
}
</style>
