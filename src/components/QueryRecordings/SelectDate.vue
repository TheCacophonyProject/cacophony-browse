<template>
  <b-form-group>
    <label>{{ title }}</label>
    <input
    type="date"
    class="form-control"
    v-bind:value="myvalue"
    v-on:input="$emit('input', $event.target.value)"/>
  </b-form-group>
</template>

<script>

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'animal-select',
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data () {
    return {
    }
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {
  },
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {
    title: String,
    myvalue: String
  }
}
</script>
