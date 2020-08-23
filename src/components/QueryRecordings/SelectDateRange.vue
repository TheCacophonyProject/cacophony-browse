<template>
  <div>
    <b-form-group>
      <label>Date range</label>
      <b-form-select
        v-model="dateRange"
        :options="options"
      />
    <b-form-row>
      <b-col>
      Device data no {{ serialisedData }}
      </b-col>
    </b-form-row>

    </b-form-group>
    <b-form-row v-if="dateRange === 'custom'">
      <b-col sm="6">
        <SelectDate v-model="fromDate" title="From" />
      </b-col>
      <b-col sm="6">
        <SelectDate v-model="toDate" title="To" />
      </b-col>
    </b-form-row>
  </div>
</template>

<script>
import SelectDate from "./SelectDate.vue";


export default {
  name: "SelectDateRange",  
  components: { SelectDate },
  props: {
    dateData: {
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
        if (this.toDate && this.toDate.trim() !== "") {
          dateData.from = this.fromDate + " 00:00:00";
        }
        if (this.toDate && this.toDate.trim() !== "") {
          dateData.to = this.toDate + " 00:00:00";
        }
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

      this.fromDate = dateObject.from;
      this.toDate = dateObject.to;
    },
    makeDateDescription() {
      return "blah blah blah";
    }
  },

  watch: {
    serialisedData: function (val) {
      this.$emit("update-dates", this.serialisedData);
      this.$emit("update-date-description", this.makeDateDescription());
    },
    dateData: function (val) {
      this.deserialise(val);
    }
  }
};
</script>
