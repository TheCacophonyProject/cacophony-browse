<template>
  <div class="img-buttons">
    <span 
      title="Previous for device, skipping bird &amp; false-positives" 
      @click="nextRecording('previous', 'any', ['interesting'])">
      <font-awesome-icon 
        icon="asterisk"
        style="color: red"
        transform="up-24 right-10 shrink-3"
        value="?" />
      <font-awesome-icon 
        class="fa-3x"
        icon="angle-double-left" />
    </span>
    <span 
      title="Previous for device, not manually tagged" 
      @click="nextRecording('previous', 'no-human')">
      <font-awesome-icon 
        icon="question"
        style="color: green"
        transform="up-24 right-10 shrink-3"
        value="?" />
      <font-awesome-icon 
        class="fa-3x"
        icon="angle-left" />
    </span>
    <span 
      title="Previous for device" 
      @click="nextRecording('previous', 'any')">
      <font-awesome-icon 
        icon="angle-left" 
        class="fa-3x" />
    </span>
    <span 
      title="Next for device" 
      @click="nextRecording('next', 'any')">
      <font-awesome-icon 
        icon="angle-right" 
        class="fa-3x" />
    </span>
    <span 
      title="Next for device, not manually tagged" 
      @click="nextRecording('next', 'no-human')">
      <font-awesome-icon 
        class="fa-3x"
        icon="angle-right" />
      <font-awesome-icon 
        icon="question"
        style="color: green"
        transform="up-24 left-10 shrink-3"
        value="?" />
    </span>
    <span 
      title="Next for device, skipping birds &amp; false-positives" 
      @click="nextRecording('next', 'any', ['interesting'])">
      <font-awesome-icon 
        class="fa-3x"
        icon="angle-double-right" />
      <font-awesome-icon 
        icon="asterisk"
        style="color: red"
        transform="up-24 left-10 shrink-3"
        value="?" />
    </span>
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
.img-buttons
  span {
    cursor: pointer;
    width: 4em;
    max-height: 4em;
    box-sizing: border-box;
    display: inline-block;
    opacity: 0.6;
  }
  span:hover {
    opacity: 1;
  }
</style>
