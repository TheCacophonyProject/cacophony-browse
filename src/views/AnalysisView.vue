<template>
  <b-container>
    <ScaleChoice 
      v-if="!fetching" 
      v-model="logarithmic" />
    <div style="height: 60vh; width: 100%">
      <Spinner :fetching="fetching" />
      <BarChart
        v-if="!fetching"
        :title="title"
        :data="data"
        :log="logarithmic"
        x-axis-label="Device Name"
        y-axis-label="Number of Recordings"
        @click="gotoRecordingsSearchPage($event)"
      />
    </div>
    <b-row>
      <b-col>
        <DateRange 
          v-model="dateRange" 
          :vertical="vertical" />
      </b-col>
      <b-col>
        <RecordingType 
          v-model="recordingType" 
          :vertical="vertical" />
      </b-col>
      <b-col>
        <DeviceGroups 
          v-model="showGroups" 
          :all-groups="allGroups" />
      </b-col>
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
  </div></b-container
  >
</template>

<script>
import BarChart from "../components/Chart/BarChart.vue";
import Spinner from "../components/Spinner.vue";
import api from "./../api/Recording.api.js";
import DateRange from "../components/Analysis/DateRange.vue";
import RecordingType from "../components/Analysis/RecordingType.vue";
import DeviceGroups from "../components/Analysis/DeviceGroups.vue";
import ScaleChoice from "../components/Analysis/ScaleChoice.vue";

export default {
  name: "AnalysisView",
  components: {
    BarChart,
    Spinner,
    DateRange,
    RecordingType,
    DeviceGroups,
    ScaleChoice
  },
  props: {},
  data() {
    return {
      lastHue: -60,
      deviceCount: {},
      title: "",
      data: {},
      fetching: false,
      unused: [],
      width: window.innerWidth,
      showGroups: "all",
      logarithmic: false
    };
  },
  computed: {
    recordingType: {
      get() {
        return this.$store.state.User.recordingTypePref;
      },
      set(value) {
        this.$store.commit("User/updateRecordingTypePref", value);
      }
    },
    dateRange: {
      get() {
        return this.$store.state.User.analysisDatePref;
      },
      set(value) {
        this.$store.commit("User/updateAnalysisDatePref", value);
      }
    },
    devices: function() {
      let devices;
      if (this.showGroups === "all") {
        devices = this.$store.state.Devices.devices;
      } else {
        for (const group of this.allGroups) {
          if (group.id === this.showGroups) {
            devices = group.devices;
          }
        }
      }
      return devices.map(device => {
        return {
          id: device.id,
          name: device.devicename
        };
      });
    },
    allGroups: function() {
      return this.$store.state.Groups.groups.map(group => {
        return {
          id: group.id,
          name: group.groupname,
          devices: group.Devices
        };
      });
    },
    type: function() {
      switch (this.recordingType) {
        case "video":
          return "thermalRaw";
        case "audio":
          return "audio";
        default:
          return ["thermalRaw", "audio"];
      }
    },
    vertical: function() {
      // Change button orientation to vertical on small screen sizes
      return this.width < 576;
    }
  },
  watch: {
    dateRange: function() {
      this.getData();
    },
    recordingType: function() {
      this.getData();
    },
    showGroups: function() {
      this.getData();
    },
    logarithmic: function() {
      // Trigger a re-draw of the graph without fetching data again
      this.fetching = true;
      this.$nextTick(() => {
        this.fetching = false;
      });
    }
  },
  created: async function() {
    await this.$store.dispatch("Devices/GET_DEVICES");
    await this.$store.dispatch("Groups/GET_GROUPS");
    await this.getData();
    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
    });
  },
  methods: {
    getData: async function() {
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
      let { result: allData } = await api.query(params);
      // Check whether all data was fetched
      // if not, run again with increased limit to get all rows
      if (allData.count > limit) {
        params.limit = allData.count;
        ({ result: allData } = await api.query(params));
      }
      // Count the number of recordings for each device
      this.devices.map(device => (this.deviceCount[device.id] = 0));
      for (const row of allData.rows) {
        this.deviceCount[row.DeviceId] += 1;
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
            data: data.map(item => item.count),
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
          }
        ]
      };
      const title = "Device Activity";
      if (this.dateRange === 0) {
        this.title = `${title} (All time)`;
      } else if (this.dateRange === 1) {
        this.title = `${title} (Last 24 Hours)`;
      } else {
        this.title = `${title} (Last ${this.dateRange} days)`;
      }
      this.fetching = false;
    },
    dateQuery() {
      const toDate = new Date();

      if (this.dateRange === 0) {
        // All time option
        return {
          $lt: this.formatQueryDate(toDate)
        };
      } else {
        const fromDate = new Date(
          toDate.getTime() - this.dateRange * 24 * 60 * 60 * 1000
        );
        return {
          $gt: this.formatQueryDate(fromDate),
          $lt: this.formatQueryDate(toDate)
        };
      }
    },
    padLeft(str, char, len) {
      while (str.toString().length < len) {
        str = `${char}${str}`;
      }
      return str;
    },
    formatQueryDate(date) {
      return `${date.getFullYear()}-${this.padLeft(
        date.getMonth() + 1,
        "0",
        2
      )}-${this.padLeft(date.getDate(), "0", 2)} ${this.padLeft(
        date.getHours(),
        "0",
        2
      )}:${this.padLeft(date.getMinutes(), "0", 2)}:${this.padLeft(
        date.getSeconds(),
        "0",
        2
      )}`;
    },
    gotoRecordingsSearchPage(array) {
      const deviceName = array[0]._model.label;
      const device = this.devices.find(device => {
        return device.name === deviceName;
      });
      const whereQuery = {
        DeviceId: [device],
        type: this.recordingType
      };
      if (this.dateRange === 0) {
        whereQuery.dateRange = "all";
      } else {
        whereQuery.dateRange = "customDateRange";
        whereQuery.recordingDateTime = this.dateQuery();
      }

      this.$router.push({
        path: "recordings",
        query: {
          where: JSON.stringify(whereQuery)
        }
      });
    }
  }
};
</script>
