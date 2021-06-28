<template>
  <b-row class="criteria">
    <b-col sm="2">
      <label>Days</label>
      <b-form-input
        :max="28"
        v-model="days"
        type="number"
        min="1"
      />
    </b-col>
    <b-col sm="4">
      <label>Date range</label>
      <b-form-select
        v-model="dateRange"
        :options="options"
        data-cy="date-select"
      />
    </b-col>
    <b-col sm="4">
      <SelectDate
        v-model="fromDate"
        :before-date-time="toDate || ''"
        v-if="dateRange === 'custom'"
        title="From"
        data-cy="date-from"
      />      <!-- <label>Model</label>
      <b-form-input
        v-model="aiModel"
        type="string"
        placeholder="Default"
      /> -->
    </b-col>
    <b-col sm="2">
      <label/>
      <b-button :disabled="disabled" block variant="primary" @click="submit">
        <span v-if="!disabled">Search</span>
        <span v-else>Searching...</span>
      </b-button>
    </b-col>
  </b-row>
</template>

<script>
import SelectDate from "../QueryRecordings/SelectDate.vue";

export default {
  name: "MetricsSearchParams",
  components: { SelectDate },
  props: {
    disabled: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      days: 7,
      aiModel: "",
      start: null,
      dateRange: "recent",
      options: [
        {
          value: "recent",
          text: "Most Recent",
        },
        {
          value: "custom",
          text: "Choose start date",
        }
      ]
    };
  },
  created() {
    this.$emit("input", this.serialisedData);
  },
  computed: {
    serialisedData: function () {
    },
  },
  methods: {
    updateDays(newValue) {
    },
    submit() {
      let params = { days: this.days };
      if (this.start) {
        params.from = this.start;
      }

      if (this.aiModel && this.aiModel.length > 0) {
        params.aiModel = this.aiModel;
      }

      this.$emit("submit", params);
    }
  },

  watch: {
    serialisedData: function (value) {
      this.$emit("input", value);
    },
    value: function (val) {
      this.deserialise(val);
    },
  },
};
</script>
<style scoped>
.filter {
  width: 33%;
}

.criteria {
  padding: 1em;
  border-bottom: 2px solid lightgrey;
  margin-bottom: 1em;
}

</style>
<style>

.criteria label {
  margin-bottom: 0;
}

</style>
