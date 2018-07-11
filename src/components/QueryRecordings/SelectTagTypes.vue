<template>
  <b-form-group>
    <label>Tag Types</label>

    <multiselect
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-bind:options="options"
      v-bind:close-on-select="true"
      track-by="text"
      label="label"
      placeholder="any"
      ></multiselect>
  </b-form-group>
</template>

<script>
  export default {
    // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
    name: 'select-tag-types',
    // https://vuejs.org/v2/style-guide/#Component-data-essential
    data () {
      return {
        options: [
          { text: null, label: 'any' },
          { text: 'untagged', label: 'untagged only' },
          { text: 'tagged', label: 'tagged only' },
          { text: 'automatic-only', label: 'automatic only' },
          { text: 'human-only', label: 'manual only'},
          { text: 'automatic+human', label: 'both automatic & manual'}
        ]
      }
    },
    // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
    computed: {
    },
    // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
    props: {value: Object}
  }

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
