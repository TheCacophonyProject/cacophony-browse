<template>
  <div>
    <b-form-group>
      <label>Date range</label>
      <b-form-select
        v-model="dateRange"
        :options="options"
      />
    </b-form-group>
    <b-form-group>
      <SelectDate v-model="fromDate" v-if="dateRange === 'custom'" title="From" />
      <SelectDate v-model="toDate" v-if="dateRange === 'custom'" title="To" />
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
          text: "Last 30 days",
        },
        {
          value: 90,
          text: "Last 90 days"
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
  computed: {
    serialisedData: function () {
      let dateData = {};
      if (this.dateRange === 'custom') {
        dateData.from = this.fromDate;
        dateData.to = this.toDate;
      } else {
        dateData.days = this.dateRange;
      }
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
      this.toDate = dateObject.to  || "";
    },
    makeDateDescription() {
      return "blah blah blah";
    }
  },

  watch: {
    serialisedData: function (val) {
      this.$emit("input", this.serialisedData);
      this.$emit("update-date-description", this.makeDateDescription());
    },
    value: function(val) {
      this.deserialise(val);
    },
  }
};
</script>
