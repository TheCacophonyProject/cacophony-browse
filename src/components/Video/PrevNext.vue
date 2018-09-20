<template>
  <div class="img-buttons">
    <img
      class="img-button"
      title="Previous for device, skipping bird &amp; false-positives"
      src="../../assets/video/previous-interesting.png"
      @click="nextRecording('previous', 'any', ['interesting'])">
    <img
      class="img-button"
      title="Previous for device, not manually tagged"
      src="../../assets/video/previous-no-human.png"
      @click="nextRecording('previous', 'no-human')">
    <img
      class="img-button"
      title="Previous for device"
      src="../../assets/video/previous.png"
      @click="nextRecording('previous', 'any')">
    <img
      class="img-button"
      title="Next for device"
      src="../../assets/video/next.png"
      @click="nextRecording('next', 'any')" >
    <img
      class="img-button"
      title="Next for device, not manually tagged"
      src="../../assets/video/next-no-human.png"
      @click="nextRecording('next', 'no-human')" >
    <img
      class="img-button"
      title="Next for device, skipping birds &amp; false-positives"
      src="../../assets/video/next-interesting.png"
      @click="nextRecording('next', 'any', ['interesting'])" >
  </div>
</template>

<script>

export default {
  name: 'PrevNext',
  props: {
    recording: {
      type: Object,
      default: function () {
        return {};
      }
    }
  },
  methods: {
    nextRecording(direction, tagMode, tags) {
      const data = {
        direction: direction,
        tagMode: tagMode,
        tags: tags
      };
      this.$emit('nextRecording', data);
    }
  }
};

</script>

<style scoped>
.img-buttons {
  padding: 1em;
  text-align: center;
}
.img-button {
  cursor: pointer;
  box-sizing: border-box;
  width: 4em;
  max-height: 4em;
}
</style>
