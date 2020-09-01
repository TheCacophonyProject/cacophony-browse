<template>
  <div class="img-buttons">
    <span
      v-b-tooltip.hover.bottomleft="'Previous in search'"
      @click="gotoNextRecording('previous', 'any')"
    >
      <font-awesome-icon icon="angle-left" class="fa-3x" />
    </span>
    <span
      v-b-tooltip.hover.bottomleft="'Next in search'"
      @click="gotoNextRecording('next', 'any')"
    >
      <font-awesome-icon icon="angle-right" class="fa-3x" />
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
