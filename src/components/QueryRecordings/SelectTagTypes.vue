<template>
  <b-form-group
    v-b-tooltip.hover="tooltipTitle">
    <label>Videos </label>

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
        { value: 'any', text: 'all' },
        { value: 'untagged', text: 'untagged only' },
        { value: 'tagged', text: 'tagged as...' },
        { value: 'human-tagged', text: 'human tagged as...' },
        { value: 'automatic-tagged', text: 'ai tagged as...' },
        { value: 'both-tagged', text: 'ai and human tagged as...' },
        { value: 'automatic-only', text: 'ai tagged only' },
        { value: 'human-only', text: 'human tagged only'},
        { value: 'automatic+human', text: 'both ai & human tagged'},
        { value: 'no-human', text: 'not tagged by human'}
      ],
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
