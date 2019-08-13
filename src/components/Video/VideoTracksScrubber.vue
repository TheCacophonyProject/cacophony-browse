<template>
  <div
    v-if="tracks && duration"
    ref="scrubber"
    :style="{
      height: `${(10 * tracks.length) + 10}px`
    }"
    class="track-scrubber"
  >
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
    maybeInitScrubber() {
      if (this.tracks && this.duration && this.tracks.length) {
        this.$nextTick(() => {
          const scrubber = this.$refs.scrubber;
          const canvas = this.$refs.canvas;
          const passive = { passive: false };
          let wasPaused = false;

          const touchMove = (event) => {
            event.preventDefault();
            const x = event.targetTouches[0].x - scrubber.getBoundingClientRect().x;
            const timeOffset = x / this.canvasWidth;
            this.setTimeAndRedraw(timeOffset * this.duration);
          };

          const touchEnd = (event) => {
            event.preventDefault();
            if (!wasPaused) {
              this.$refs.player.player.play();
            }
            window.removeEventListener('touchend', touchEnd);
            window.removeEventListener('touchmove', touchMove);
          };

          scrubber.addEventListener('touchstart', (event) => {
            event.preventDefault();
            const player = this.$refs.player;
            const htmlPlayer = player.$refs.video;
            wasPaused = htmlPlayer.paused;
            if (!wasPaused) {
              player.player.pause();
            }
            touchMove(event);
            window.addEventListener('touchmove', touchMove, passive);
            window.addEventListener('touchend', touchEnd, passive);
          }, passive);

          const mouseMove = (event) => {
            event.preventDefault();
            const x = event.x - scrubber.getBoundingClientRect().x;
            const timeOffset = x / this.canvasWidth;
            this.setTimeAndRedraw(timeOffset * this.duration);
          };

          const mouseEnd = (event) => {
            event.preventDefault();
            if (!wasPaused) {
              this.$refs.player.player.play();
            }
            window.removeEventListener('mouseup', mouseEnd);
            window.removeEventListener('mousemove', mouseMove);
          };

          scrubber.addEventListener('mousedown', (event) => {
            event.preventDefault();
            const player = this.$refs.player;
            const htmlPlayer = player.$refs.video;
            wasPaused = htmlPlayer.paused;
            if (!wasPaused) {
              player.player.pause();
            }
            mouseMove(event);
            window.addEventListener('mousemove', mouseMove);
            window.addEventListener('mouseup', mouseEnd);
          }, passive);

          const hitTestPos = (x, y) => {
            const allFrameData = this.getVideoFrameDataForAllTracksAtTime(this.currentVideoTime);
            for (const rect of allFrameData) {
              if (
                (rect.x <= x && rect.x + rect.rectWidth > x) &&
                (rect.y <= y && rect.y + rect.rectHeight > y)
              ) {
                return rect;
              }
            }
            return null;
          };

          canvas.addEventListener('click', function (event) {
            const canvasOffset = canvas.getBoundingClientRect();
            const x = event.x - canvasOffset.x;
            const y = event.y - canvasOffset.y;
            const hitRect = hitTestPos(x, y);
            if (hitRect) {
              this.$emit('trackSelected', hitRect.trackIndex);
            }
          }.bind(this));

          canvas.addEventListener('mousemove', (event) => {
            const canvasOffset = canvas.getBoundingClientRect();
            const x = event.x - canvasOffset.x;
            const y = event.y - canvasOffset.y;
            const hitRect = hitTestPos(x, y);
            // set cursor
            canvas.style.cursor = hitRect !== null ? 'pointer' : 'default';
          });
        });
      }
    },
    getVideoFrameDataForAllTracksAtTime(currentTime) {
      const search = (positions, currentTime) => {
        // TODO(jon): Optimise this lookup, binary search?
        // Probably doesn't really matter
        let i = positions.length - 1;
        while (positions[i][0] > currentTime) {
          i--;
        }
        return positions[i];
      };
      // First check if the last position we got is still the current position?
      // See if tracks are in range.
      return (
        this.tracks
          .filter(({data: {start_s, end_s}}) => (
            start_s <= currentTime && end_s >= currentTime
          ))
          .map(({data: {positions}, trackIndex}) => {
            const item = search(positions, currentTime)[1];
            return {
              rectWidth: (item[2] - item[0]) * this.scale,
              rectHeight: (item[3] - item[1]) * this.scale,
              x: item[0] * this.scale,
              y: item[1] * this.scale,
              trackIndex,
            };
          })
      );
    },
  }
};
</script>

<style scoped>

</style>
