<template>
  <b-container>
    <div style="height: 60vh; width: 100%">

      <Spinner :fetching="fetching"/>
      <BarChart
        v-if="!fetching"
        :title="title"
        :data="data"
        x-axis-label = "Device Name"
        y-axis-label="Number of Recordings"
      />
    </div>
    <DateRange
      v-model="dateRange"
      @update="getData()"/>
  </b-container>
</template>

<script>

import BarChart from '../components/Chart/BarChart.vue';
import Spinner from '../components/Spinner.vue';
import api from './../api/Recording.api.js';
import DateRange from '../components/Data/DateRange.vue';

export default {
  name: 'DataView',
  components: {
    BarChart, Spinner, DateRange
  },
  props: {

  },
  data () {
    return {
      lastHue: -60,
      deviceCount: {},
      title: "",
      data: {},
      fetching: false,
      dateRange: 7
    };
  },
  computed: {
    devices: function () {
      return this.$store.state.Devices.devices.map(device => {
        return {id: device.id, name: device.devicename};
      });
      // .sort((a,b) => {
      //   return a.name - b.name;
      // });
    }
  },
  created: async function() {
    await this.$store.dispatch('Devices/GET_DEVICES');
    await this.getData();
  },
  methods: {
    getData: async function () {
      this.fetching = true;
      // Extract query information
      const where = {
        type: 'thermalRaw',
        recordingDateTime: this.dateQuery()
      };
      const limit = 1000;
      const params = {
        where: JSON.stringify(where),
        limit: limit,
        offset: 0,
        tagMode: "any"
      };

      // Get all data (first 1000 rows)
      let allData = await api.query(params);
      // Check whether all data was fetched
      // if not, run again with increased limit to get all rows
      if (allData.count > limit) {
        params.limit = allData.count;
        allData = await api.query(params);
      }

      // Count the number of recordings for each device
      this.devices.map((device) => this.deviceCount[device.id] = 0);
      for (const row of allData.rows) {
        this.deviceCount[row.Device.id] += 1;
      }
      // Create data and label variables
      const labels = [];
      const data = [];
      const unused = [];
      for (const device of this.devices) {
        if (this.deviceCount[device.id] > 0) {
          data.push({
            id: device.id,
            count: this.deviceCount[device.id],
            devicename: device.name
          });
          labels.push(device.name);
        } else {
          unused.push(device.name);
        }
      }

      // Create colors for bar graphs
      const colorPicker = () => {
        let hue;
        if (this.lastHue < 360) {
          hue = this.lastHue + 60;
          this.lastHue = hue;
        } else {
          hue = this.lastHue - 339;
          this.lastHue = hue;
        }
        const hsl = `hsl(${hue}, 80%, 80%)`;
        return hsl;
      };
      this.lastHue = -60; // reset starting hue
      const colors = data.map(() => colorPicker());
      // Create dataset suitable for ChartJS
      this.data = {
        labels: labels,
        datasets: [
          {
            data: data.map((item) => item.count),
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
          }
        ]
      };
      if (this.dateRange === 0) {
        this.title = 'Device Activity (All time)';
      } else {
        this.title = `Device Activity (Last ${this.dateRange} days)`;
      }
      this.fetching = false;
    },
    dateQuery() {
      const parseDate = function (date) {
        const day = (0 + date.getDate().toString()).slice(-2);
        const month = (0 + (date.getMonth() + 1).toString()).slice(-2);
        const year = date.getFullYear();
        return year + "-" + month + "-" + day;
      };
      const today = new Date(Date.now()); // today
      const toDate = parseDate(today); // to date as text

      if (this.dateRange === 0) {
        return {
          "$lt": toDate
        };
      } else {
        const todayms = today.getTime(); // today in ms
        const daysms = this.dateRange*24*60*60*1000; // days to go back in ms
        const fromdatems = todayms - daysms; // from date in ms
        const fromDate = parseDate(new Date(fromdatems)); // from date as text
        return {
          "$gt": fromDate,
          "$lt": toDate
        };
      }

    }
  }
};
</script>
