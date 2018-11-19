<template>
  <b-container>
    <div style="height: 60vh; width: 100%">

      <Spinner :fetching="fetching"/>
      <BarChart
        v-if="!fetching"
        :title="title"
        :data="data"
        :log="logarithmic"
        x-axis-label = "Device Name"
        y-axis-label="Number of Recordings"
        @click="gotoRecordingsSearchPage($event)"
      />
    </div>
    <b-row>
      <b-col>
        <DateRange
          v-model="dateRange"
          :vertical="vertical"/>
      </b-col>
      <b-col>
        <RecordingType
          v-model="recordingType"
          :vertical="vertical"/>
      </b-col>
      <b-col>
        <DeviceGroups
          v-model="showGroups"
          :all-groups="allGroups"/>
      </b-col>
      <b-col>
        <ScaleChoice
          v-model="logarithmic"
          :vertical="vertical"/>
      </b-col>
      {{ logarithmic }}
    </b-row>

    <div
      v-if="!fetching && unused.length > 0"
      class="mt-2">
      Devices with no recordings for the selected time period:
      <ul>
        <li
          v-for="(name, index) in unused"
          :key="index">
          {{ name }}
        </li>
      </ul>
  </div></b-container>
</template>

<script>

import BarChart from '../components/Chart/BarChart.vue';
import Spinner from '../components/Spinner.vue';
import api from './../api/Recording.api.js';
import DateRange from '../components/Analysis/DateRange.vue';
import RecordingType from '../components/Analysis/RecordingType.vue';
import DeviceGroups from '../components/Analysis/DeviceGroups.vue';
import ScaleChoice from '../components/Analysis/ScaleChoice.vue';

export default {
  name: 'AnalysisView',
  components: {
    BarChart, Spinner, DateRange, RecordingType, DeviceGroups, ScaleChoice
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
      unused: [],
      width: window.innerWidth,
      showGroups: 'all',
      logarithmic: false
    };
  },
  computed: {
    recordingType: {
      get () {
        return this.$store.state.User.recordingTypePref;
      },
      set (value) {
        this.$store.commit('User/updateRecordingTypePref', value);
      }
    },
    dateRange: {
      get () {
        return this.$store.state.User.analysisDatePref;
      },
      set (value) {
        this.$store.commit('User/updateAnalysisDatePref', value);
      }
    },
    devices: function () {
      let devices;
      if (this.showGroups === 'all') {
        devices = this.$store.state.Devices.devices;
      } else {
        for (const group of this.allGroups) {
          if (group.id === this.showGroups) {
            devices = group.devices;
          }
        }
      }
      return devices.map(device => {
        return {id: device.id, name: device.devicename};
      });
      // .sort((a,b) => {
      //   return a.name - b.name;
      // });
    },
    allGroups: function () {
      return this.$store.state.Groups.groups.map(group => {
        return {id: group.id, name: group.groupname, devices: group.Devices};
      });
      // .sort((a,b) => {
      //   return a.name - b.name;
      // });
    },
    type: function () {
      switch (this.recordingType) {
      case 'both':
        return ['thermalRaw', 'audio'];
      case 'video':
        return 'thermalRaw';
      case 'audio':
        return 'audio';
      default:
        return 'both';
      }
    },
    vertical: function () {
      // Change button orientation to vertical on small screen sizes
      return this.width < 576;
    }
  },
  watch: {
    dateRange: function () {
      this.getData();
    },
    recordingType: function () {
      this.getData();
    },
    showGroups: function () {
      this.getData();
    },
    logarithmic: function () {
      this.getData();
    },
  },
  created: async function() {
    await this.$store.dispatch('Devices/GET_DEVICES');
    await this.$store.dispatch('Groups/GET_GROUPS');
    await this.getData();
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
    });
  },
  methods: {
    getData: async function () {
      this.fetching = true;
      // Extract query information
      const where = {
        type: this.type,
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
      this.unused = [];
      for (const device of this.devices) {
        if (this.deviceCount[device.id] > 0) {
          data.push({
            id: device.id,
            count: this.deviceCount[device.id],
            devicename: device.name
          });
          labels.push(device.name);
        } else {
          this.unused.push(device.name);
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
      const title = 'Device Activity';
      if (this.dateRange === 0) {
        this.title = `${title} (All time)`;
      } else if (this.dateRange ===1) {
        this.title = `${title} (Last 24 Hours)`;
      }else {
        this.title = `${title} (Last ${this.dateRange} days)`;
      }
      this.fetching = false;
    },
    dateQuery() {
      const parseDate = function (date) {
        const hour = (0 + date.getHours().toString()).slice(-2);
        const min = (0 + date.getMinutes().toString()).slice(-2);
        const day = (0 + date.getDate().toString()).slice(-2);
        const month = (0 + (date.getMonth() + 1).toString()).slice(-2);
        const year = date.getFullYear();
        return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + "00";
      };
      const today = new Date(Date.now()); // today
      const toDate = parseDate(today); // to date as text

      if (this.dateRange === 0) {
        // All time option
        return {
          "$lt": toDate
        };
      }       else {
        const todayms = today.getTime(); // today in ms
        const daysms = this.dateRange*24*60*60*1000; // days to go back in ms
        const fromdatems = todayms - daysms; // from date in ms
        const fromDate = parseDate(new Date(fromdatems)); // from date as text
        return {
          "$gt": fromDate,
          "$lt": toDate
        };
      }

    },
    gotoRecordingsSearchPage (array) {
      const fromDate = this.dateQuery()['$gt'].slice(0,10);
      const toDate = this.dateQuery()['$lt'].slice(0,10);
      const deviceName = array[0]._model.label;
      const deviceId = this.devices.find((device) => {
        return device.name === deviceName;
      });
      this.$router.push({
        path: 'recordings',
        query: {
          fromDate: fromDate,
          toDate: toDate,
          deviceId: JSON.stringify(deviceId),
          recordingType: this.recordingType
        }
      });
    }
  }
};
</script>
