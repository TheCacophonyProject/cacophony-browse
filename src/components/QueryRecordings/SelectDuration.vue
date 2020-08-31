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
        :max="value.maxS"
        :value="value.minS"
        type="number"
        min="0"
        class="form-control col-4"
        @change="updateMinS"
      />
      <label class="col-4 text-center col-form-label">to</label>
      <b-form-input
        :min="value.minS"
        :value="value.maxS"
        type="number"
        class="form-control col-4"
        @change="updateMaxS"
      />
    </b-form-row>
  </b-form-group>
</template>

<script>
export default {
  name: "DurationSlider",
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      options: [
        {
          value: { minS: "0", maxS: "" },
          text: "Any duration"
        },
        {
          value: { minS: "0", maxS: "20" },
          text: "Short (<20 seconds)"
        },
        {
          value: { minS: "20", maxS: "120" },
          text: "Medium (20 seconds - 2 minutes)"
        },
        {
          value: { minS: "120", maxS: "" },
          text: "Long (> 2 minutes)"
        },
        {
          value: {
            isCustom: true,
            minS: "0",
            maxS: "100"
          },
          text: "Custom duration"
        }
      ],
      isCustom: false
    };
  },
  computed: {
    selectedOption: function() {
      return this.getOptionForValue(this.value);
    }
  },
  created() {
    this.updateDurationType(this.selectedOption);
    this.isCustom = this.getOptionForValue(this.value).isCustom;
  },
  methods: {
    getOptionForValue: function(value) {
      const minS = value.hasOwnProperty("minS") ? value.minS : "0";
      const maxS = value.hasOwnProperty("maxS") ? value.maxS : "";
      for (const option of this.options) {
        if (option.value.minS === minS && option.value.maxS === maxS) {
          return option.value;
        }
      }
      // Fallback to the custom option.
      return this.options[4].value;
    },
    updateMaxS: function(event) {
      const newValue = {
        maxS: event,
        minS: this.value.minS
      };
      this.emitUpdatedValue(newValue);
    },
    updateMinS: function(event) {
      const newValue = {
        maxS: this.value.maxS,
        minS: event
      };
      this.emitUpdatedValue(newValue);
    },
    updateDurationType: function(val) {
      val = val.hasOwnProperty("value") ? val.value : val;
      this.isCustom = val.isCustom;
      const { minS, maxS } = val;
      const e = {
        maxS,
        minS
      };
      this.emitUpdatedValue(e);
    },
    makeDurationDescription(duration) {
      if (duration.hasOwnProperty("minS")) {
        if (duration.hasOwnProperty("maxS")) {
          return ` with duration <strong>${duration.minS}s</strong>&nbsp;&ndash;&nbsp;<strong>${duration.maxS}s</strong>`;
        } else {
          return ` longer than <strong>${duration.minS}s</strong>`;
        }
      } else if (duration.hasOwnProperty("maxS")) {
        return ` shorter than <strong>${duration.maxS}s</strong>`;
      } else {
        return "";
      }
    },

    emitUpdatedValue(duration) {
      if (duration.minS === "0" || duration.mins === "") {
        delete duration.minS;
      }

      if (duration.maxS === "") {
        delete duration.maxS;
      }

      duration.description = this.makeDurationDescription(duration);
      this.$emit("input", duration);
    }
  }
};
</script>
