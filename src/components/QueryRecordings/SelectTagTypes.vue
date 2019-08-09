<template>
  <b-form-group
    v-b-tooltip.hover="tooltipTitle">
    <label>Video tags</label>

    <b-form-select
      :value="value"
      :options="options"
      :disabled="disabled"
      placeholder="any"
      @input="$emit('input', $event)"
    />
  </b-form-group>
</template>
<script>
import DefaultLabels from '../../const.js';

export default {
  name: 'SelectTagTypes',
  props: {
    value: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      options: DefaultLabels.searchRecordingLabels(),
    };
  },

  computed: {
    tooltipTitle: function () {
      if (this.disabled) {
        return 'Disabled when recording type includes audio';
      } else {
        return "";
      }
    },
  }
};

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
