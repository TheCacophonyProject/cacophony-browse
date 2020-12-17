<template>
  <b-form-group label="Date range">
    <b-button-group :vertical="vertical" data-cy="date-select">
      <b-btn
        v-for="(date, index) in dates"
        :key="index"
        :variant="variant(date.value)"
        @click="$emit('input', date.value)"
      >
        {{ date.text }}
      </b-btn>
    </b-button-group>
  </b-form-group>
</template>

<script>
export default {
  name: "DateRange",
  props: {
    value: {
      type: Number,
      required: true,
    },
    vertical: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {
      dates: [
        { text: "Last 24 Hours", value: 1 },
        { text: "Last 7 Days", value: 7 },
        { text: "Last 30 Days", value: 30 },
        { text: "Last 90 Days", value: 90 },
        { text: "Last year", value: 365 },
        { text: "All Time", value: "all" },
      ],
    };
  },
  methods: {
    variant(buttonValue) {
      if (buttonValue === this.value) {
        return "primary";
      } else {
        return "secondary";
      }
    },
  },
};
</script>
