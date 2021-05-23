<template>
  <div class="img-buttons">
    <button
      v-b-tooltip.hover.bottomleft="'Earlier in search'"
      @click="gotoNextRecording('previous', 'any')"
      :disabled="!canGoBackwards"
    >
      <font-awesome-icon icon="angle-left" class="fa-3x" />
    </button>
    <button
      v-b-tooltip.hover.bottomleft="'Later in search'"
      @click="gotoNextRecording('next', 'any')"
      :disabled="!canGoForwards"
    >
      <font-awesome-icon icon="angle-right" class="fa-3x" />
    </button>
  </div>
</template>

<script>
export default {
  name: "PrevNext",
  props: {
    recording: {
      type: Object,
      default: function () {
        return {};
      },
    },
    canGoForwards: {
      type: Boolean,
      default: false,
    },
    canGoBackwards: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    gotoNextRecording(...args) {
      this.$emit("nextOrPreviousRecording", { ...args });
    },
  },
};
</script>

<style scoped lang="scss">
div.img-buttons {
  padding: 0.5em;
  text-align: center;
}
.img-buttons > button {
  cursor: pointer;
  width: 4em;
  max-height: 4em;
  display: inline-block;
  opacity: 0.6;
  background: transparent;
  &:focus,
  &:active {
    outline: none;
  }
  color: inherit;
  border: 0;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  &:disabled {
    opacity: 0.3;
  }
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
