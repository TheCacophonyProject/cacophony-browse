<template>
  <div>
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
      let data = {
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
.img-button {
  cursor: pointer;
  box-sizing: border-box;
  max-width: 15%;
  max-height: 75px;
  width: auto;
  height: auto;
}

</style>
