<template>
  <b-form-group>
    <label>Tag Types</label>

    <b-form-select
      :value="value"
      :options="options"
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
  }
};

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
