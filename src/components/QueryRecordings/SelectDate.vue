<template>
  <b-form-group>
    <label>{{ title }}</label>
    <input
      :value="value"
      type="date"
      class="form-control"
      @input="$emit('input', $event.target.value)">
  </b-form-group>
</template>

<script>

export default {
  name: 'SelectDate',
  props: {
    title: {
      type: String,
      default: "Select date"
    },
    value: {
      type: String,
      required: true
    }
  }
};
</script>
