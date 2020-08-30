<template>
  <b-form-group>
    <label>{{ title }}</label>
    <b-form-row>
      <b-col sm="7">
        <input v-model="date" type="date" class="form-control" />
      </b-col>
      <b-col sm="5">
        <input v-model="time" type="time" class="form-control" />
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
      if (newDate) {
        var parts = newDate.split(" ");
        if (parts.length == 2 && parts[1].length == 8) {
          this.date = parts[0];
          this.time = parts[1].substring(0, 5);
          return;
        }
      }

      this.date = "";
      this.time = "12:00";
    }
  },
  mounted: function() {
    this.parseDate(this.value);
  },
  computed: {
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
</script>
