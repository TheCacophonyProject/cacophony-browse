<template>
  <b-form-group>
    <label>{{ title }}</label>
    <b-form-select
      :value="value"
      :options="options"
      @input="$emit('input', $event)"
    />
  </b-form-group>
</template>

<script>
export default {
  name: 'SelectDateRange',
  props: {
    title: {
      type: String,
      default: "Date range"
    },
    value: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      options: [
        { value: {}, text: "Last 24 hours" },
        { value: {}, text: "Last 3 days" },
        { value: {}, text: "Last 7 days" },
        { value: {}, text: "Custom range" },
      ]
    };
  },
  computed: {
    isCustomRange() {
      return true;//this.value.
    }
  },
};
</script>
