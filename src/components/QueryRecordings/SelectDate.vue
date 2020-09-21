<template>
  <b-form-group>
    <label>{{ title }}</label>
    <b-form-row>
      <b-col sm="7">
        <input
          v-model="date"
          type="date"
          class="form-control"
          :min="minDate"
          :max="maxDate"
        />
      </b-col>
      <b-col sm="5">
        <input
          v-model="time"
          type="time"
          class="form-control"
          :min="minTime"
          :max="maxTime"
        />
      </b-col>
    </b-form-row>
  </b-form-group>
</template>

<script>
export default {
  name: "SelectDate",
  props: {
    title: {
      type: String,
      default: "Select date"
    },
    value: {
      type: String,
      required: true
    },
    beforeDateTime: {
      type: String,
      default: ""
    },
    afterDateTime: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      time: "",
      date: ""
    };
  },
  methods: {
    parseDate(newDate) {
      this.date = parseDate(newDate);
      const parsedTime = parseTime(newDate);

      if (parsedTime.length > 0) {
        this.time = parsedTime;
      } else {
        this.time = "12:00";
      }
    }
  },
  created: function() {
    this.parseDate(this.value);
  },
  computed: {
    minDate: function() {
      return parseDate(this.afterDateTime);
    },
    maxDate: function() {
      return parseDate(this.beforeDateTime);
    },
    minTime: function() {
      if (this.date === this.minDate) {
        return parseTime(this.afterDateTime);
      }
      return "";
    },
    maxTime: function() {
      if (this.date === this.maxDate) {
        return parseTime(this.beforeDateTime);
      }
      return "";
    },
    timeDate: function() {
      if (this.date.length > 0 && this.time.length > 0) {
        return this.date + " " + this.time + ":00";
      }
      return "";
    }
  },
  watch: {
    timeDate: function(value) {
      this.$emit("input", value);
    }
  }
};

function parseDate(fullDateTime) {
  if (fullDateTime) {
    var parts = fullDateTime.split(" ");
    if (parts.length == 2 && parts[1].length > 4) {
      return parts[0];
    }
  }
  return "";
}

function parseTime(fullDateTime) {
  if (fullDateTime) {
    var parts = fullDateTime.split(" ");
    if (parts.length == 2 && parts[1].length > 4) {
      return parts[1].substring(0, 5);
    }
  }
  return "";
}
</script>
