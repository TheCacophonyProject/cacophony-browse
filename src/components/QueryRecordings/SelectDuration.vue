<template>
  <b-form-group>
    <label>Duration (sec)</label>
    <b-form-row>
      <b-form-input
        :max="value.high"
        :value="value.low"
        type="number"
        min="0"
        class="form-control col-4"
        @change="updateLow"/>
      <label class="col-4 text-center col-form-label">to</label>
      <b-form-input
        :min="value.low"
        :value="value.high"
        type="number"
        class="form-control col-4"
        @change="updateHigh"/>
    </b-form-row>
  </b-form-group>
</template>

<script>

export default {
  name: 'DurationSlider',
  components: {
  },
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  methods: {
    updateHigh: function () {
      const newValue = {
        high: event.target.value,
        low: this.value.low
      };
      this.$emit('input', newValue);
    },
    updateLow: function () {
      const newValue = {
        high: this.value.high,
        low: event.target.value
      };
      this.$emit('input', newValue);
    }
  }
};

</script>
