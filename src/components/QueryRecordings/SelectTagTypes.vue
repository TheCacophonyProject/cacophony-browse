<template>
  <b-form-group
    v-b-tooltip.hover="tooltipTitle">
    <label>Tag Types</label>

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
      options: [
        { value: 'any', text: 'any' },
        { value: 'untagged', text: 'untagged only' },
        { value: 'tagged', text: 'tagged only' },
        { value: 'automatic-only', text: 'automatic only' },
        { value: 'human-only', text: 'manual only'},
        { value: 'automatic+human', text: 'both automatic & manual'}
      ]
    };
  },
  computed: {
    tooltipTitle: function () {
      if (this.disabled) {
        return 'Disabled when recording type includes audio';
      } else {
        return "";
      }
    }
  }
};

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
