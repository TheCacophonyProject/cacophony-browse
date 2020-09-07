<template>
  <div>
    <b-form-group>
      <label>Date range</label>
      <b-form-select
        v-model="dateRange"
        :options="options"
        data-cy="date-select"
      />
    </b-form-group>
    <b-form-group>
      <SelectDate
        v-model="fromDate"
        v-if="dateRange === 'custom'"
        title="From"
        data-cy="date-from"
      />
      <SelectDate
        v-model="toDate"
        v-if="dateRange === 'custom'"
        title="To"
        data-cy="date-to"
      />
    </b-form-group>
  </div>
</template>

<script>
import SelectDate from "./SelectDate.vue";

export default {
  name: "SelectDateRange",
  components: { SelectDate },
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      toDate: "",
      fromDate: "",
      dateRange: 30,
      options: [
        {
          value: 1,
          text: "Last 24 hours"
        },
        {
          value: 3,
          text: "Last 3 days"
        },
        {
          value: 7,
          text: "Last 7 days"
        },
        {
          value: 30,
          text: "Last 30 days"
        },
        {
          value: 90,
          text: "Last 90 days"
        },
        {
          value: 365,
          text: "Last year"
        },
        {
          value: "all",
          text: "All"
        },
        {
          value: "custom",
          text: "Custom range"
        }
      ]
    };
  },
  created() {
    this.deserialise(this.value);
    this.$emit("input", this.serialisedData);
  },
  computed: {
    serialisedData: function() {
      const dateData = {};
      if (this.dateRange === "custom") {
        dateData.from = this.fromDate;
        dateData.to = this.toDate;
      } else {
        dateData.days = this.dateRange;
      }
      dateData.description = this.makeDateDescription();
      return dateData;
    }
  },
  methods: {
    deserialise(dateObject) {
      if (!dateObject) {
        this.dateRange = 30;
      } else if (dateObject.days) {
        this.dateRange = dateObject.days;
      } else {
        this.dateRange = "custom";
      }

      this.fromDate = dateObject.from || "";
      this.toDate = dateObject.to || "";
    },
    makeDateDescription() {
      if (this.dateRange === "all") {
        return " in all recordings";
      } else if (this.dateRange === "custom") {
        const start = this.fromDate.length ? this.fromDate.split(" ")[0] : "";
        const end = this.toDate.length > 0 ? this.toDate.split(" ")[0] : "";
        if (start.length > 0) {
          if (end.length > 0) {
            return ` recorded between <strong>${start} and ${end}</strong>`;
          } else {
            return ` recorded after <strong>${start}</strong>`;
          }
        } else if (end.length > 0) {
          return ` recorded after <strong>${end}</strong>`;
        } else {
          return " in all recordings ";
        }
      } else if (this.dateRange == 1) {
        return " in the <strong>last 24 hours</strong> ";
      } else {
        return ` in the <strong>last ${this.dateRange} days</strong>`;
      }
    }
  },

  watch: {
    serialisedData: function(value) {
      this.$emit("input", value);
    },
    value: function(val) {
      this.deserialise(val);
    }
  }
};
</script>
