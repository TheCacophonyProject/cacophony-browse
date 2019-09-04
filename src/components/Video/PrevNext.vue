<template>
  <div class="img-buttons">
    <span
      v-b-tooltip.hover.bottomleft="'Previous for device, skipping bird &amp; false-positives'"
      @click="gotoNextRecording('previous', 'tagged', ['interesting'])">
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
      v-b-tooltip.hover.bottomleft="'Previous for device, needs tagging'"
      @click="gotoNextRecording('previous', 'no-human')">
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
      v-b-tooltip.hover.bottomleft="'Previous for device'"
      @click="gotoNextRecording('previous', 'any')">
      <font-awesome-icon
        icon="angle-left"
        class="fa-3x" />
    </span>
    <span
      v-b-tooltip.hover.bottomleft="'Next for device'"
      @click="gotoNextRecording('next', 'any')">
      <font-awesome-icon
        icon="angle-right"
        class="fa-3x" />
    </span>
    <span
      v-b-tooltip.hover.bottomleft="'Next for device, needs tagging'"
      @click="gotoNextRecording('next', 'no-human')">
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
      v-b-tooltip.hover.bottomleft="'Next for device, skipping birds &amp; false-positives'"
      @click="gotoNextRecording('next', 'tagged', ['interesting'])">
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
  name: "PrevNext",
  props: {
    recording: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  methods: {
    gotoNextRecording(...args) {
      this.$emit("nextOrPreviousRecording", { ...args });
    }
  }
};
</script>

<style scoped>
div.img-buttons {
  padding: 0.5em;
  text-align: center;
}
.img-buttons span {
  cursor: pointer;
  width: 4em;
  max-height: 4em;
  box-sizing: border-box;
  display: inline-block;
  opacity: 0.6;
}

@media only screen and (max-width: 575px) {
  div.img-buttons {
    font-size: 80%;
  }
}

span:hover {
  opacity: 1;
}
</style>
