<template>
  <b-form-group>
    <label>Duration (sec)</label>
    <b-form-select
      :value="selectedOption"
      :options="options"
      @input="updateDurationType"
    />
    <b-form-row
      v-if="isCustom"
      style="margin-top: 15px; margin-left: 0; margin-right: 0;"
    >
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
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      options: [
        { value: { low: "0", high: "10" }, text: "Short (<10 seconds)" },
        { value: { low: "10", high: "60" }, text: "Medium (10 seconds - 1 minute)" },
        { value: { low: "60", high: "" }, text: "Long (> 1 minute)" },
        { value: { isCustom: true, low: "0", high: "" }, text: "Custom duration" },
      ],
    };
  },
  computed: {
    selectedOption: function () {
      return this.getOptionForValue(this.value);
    },
    isCustom: function () {
      return this.selectedOption.isCustom;
    }
  },
  methods: {
    getOptionForValue: function ({low, high}) {
      low = Number(low);
      high = Number(high) || Number.POSITIVE_INFINITY;
      for (const option of this.options) {
        const optionLow = Number(option.value.low);
        const optionHigh = Number(option.value.high) || Number.POSITIVE_INFINITY;
        if (optionLow === low && optionHigh === high) {
          return option.value;
        }
      }
      // Fallback to the custom option.
      return this.options[this.options.length - 1].value;
    },
    updateHigh: function (event) {
      const newValue = {
        high: event,
        low: this.value.low
      };
      this.$emit('input', newValue);
    },
    updateLow: function (event) {
      const newValue = {
        high: this.value.high,
        low: event
      };
      this.$emit('input', newValue);
    },
    updateDurationType: function (val) {
      val = val.hasOwnProperty('value') ? val.value : val;
      const {low, high} = val;
      const e = {
        high,
        low,
      };
      this.$emit('input', e);
    }
  },
};

</script>
