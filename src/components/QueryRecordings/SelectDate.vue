<template>
  <b-form-group>
    <label>{{ title }}</label>
    <input
      :value="myvalue"
      type="date"
      class="form-control"
      @input="$emit('input', $event.target.value)">
  </b-form-group>
</template>

<script>

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'AnimalSelect',
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {
    title: {
      type: String,
      default: "Select date"
    },
    myvalue: {
      type: String,
      required: true
    }
  },
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data () {
    return {
    }
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {
  },
}
</script>
