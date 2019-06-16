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
        { value: { relativeDateRange: -1 }, text: "Last 24 hours" },
        { value: { relativeDateRange: -3 }, text: "Last 3 days" },
        { value: { relativeDateRange: -7 }, text: "Last 7 days" },
        { value: { isCustom: true }, text: "Custom range" },
      ]
    };
  },
  computed: {
    isCustomRange() {
      return this.value.hasOwnProperty('isCustom');
    }
  },
};
</script>
