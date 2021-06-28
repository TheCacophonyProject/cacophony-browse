<template>
  <b-row class="criteria">
    <b-col sm="2">
      <label>Days</label>
      <b-form-input
        :max="28"
        v-model="days"
        type="number"
        min="1"
        @change="calculateBeforeDate"
      />
    </b-col>
    <b-col sm="4">
      <label >Start date:</label>
      <input
        v-model="fromDate"
        type="date"
        class="form-control"
        :max="beforeDateString"
      />
    </b-col> 
    <b-col sm="4">

      <!-- <label>Model</label>
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
import * as moment from "moment";

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
      days: 1,
      beforeDateString: "",
      aiModel: "",
      fromDate: null,
    };
  },
  created: function() {
    this.calculateBeforeDate(this.days)
  },
  methods: {
    calculateBeforeDate(useDays) {
      this.beforeDateString = moment(new Date()).add(-1 * useDays -1, "days").format("YYYY-MM-DD");
      if (!this.fromDate || moment(this.fromDate).isAfter(this.beforeDateString)) {
        this.fromDate = this.beforeDateString;
      };
    },
    submit() {
      let params = {};
      if (this.fromDate && this.fromDate != "") {
        params.from = this.fromDate + " 12:00:00";
        params.to = moment(params.from).add(this.days, "days").format("YYYY-MM-DD") + " 12:00:00";
      }
      else {
        params.days = this.days;
      }

      if (this.aiModel && this.aiModel.length > 0) {
        params.aiModel = this.aiModel;
      }

      this.$emit("submit", params);
    }
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
