<template>
  <b-form-group label="Date range">
    <b-button-group :vertical="vertical">
      <b-btn
        v-for="(date, index) in dates"
        :key="index"
        :variant="variant(date.value)"
        @click="$emit('input', date.value)">
        {{ date.text }}
      </b-btn>
    </b-button-group>
  </b-form-group>
</template>

<script>

export default {
  name: 'DateRange',
  props: {
    value: {
      type: Number,
      required: true
    },
    vertical: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      dates: [
        {text: 'Last 7 Days', value: 7},
        {text: 'Last 30 Days', value: 30},
        {text: 'Last 60 Days', value: 60},
        {text: 'Last 365 Days', value: 365},
        {text: 'All Time', value: 0}
      ]
    };
  },
  methods: {
    variant(buttonValue) {
      if (buttonValue === this.value) {
        return 'primary';
      } else {
        return 'secondary';
      }
    }
  }
};
</script>
