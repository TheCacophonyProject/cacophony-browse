<template>
  <div class="container">
    <h2>
      All recordings - {{ groupName
      }}<span v-if="deviceName || stationName"
        >, {{ `${deviceName || stationName || ""}` }}</span
      >
      <help>
        All recordings ever made for this
        {{ `${deviceName ? "device" : "group"}` }}
      </help>
    </h2>
    <RecordingsList :query-pending="loading" :recordings="recordings" />
    <div v-if="!loading && recordings.length === 0">
      No recordings found for this {{ `${deviceName ? "device" : "group"}` }}
    </div>
  </div>
</template>

<script lang="ts">
import Help from "@/components/Help.vue";
import RecordingsList from "@/components/RecordingsList.vue";
import api from "@/api";

export default {
  name: "RecordingsTab",
  components: {
    RecordingsList,
    Help,
  },
  props: {
    groupName: { type: String, required: true },
    deviceName: { type: String, required: false, default: null },
    stationName: { type: String, required: false, default: null },
    recordingsQuery: { type: Object, required: true },
  },
  data() {
    return {
      recordings: [],
      totalRecordingCount: 0,
      loading: true,
    };
  },
  async mounted() {
    await this.fetchRecordings();
  },
  methods: {
    async fetchRecordings() {
      if (
        (this.recordingsQuery.group &&
          this.recordingsQuery.group.length &&
          this.recordingsQuery.group[0] !== null) ||
        (this.recordingsQuery.device &&
          this.recordingsQuery.device.length &&
          this.recordingsQuery.device[0] !== null) ||
        (this.recordingsQuery.station &&
          this.recordingsQuery.station.length &&
          this.recordingsQuery.station[0] !== null)
      ) {
        this.loading = true;
        try {
          const { result } = await api.recording.query(this.recordingsQuery);
          this.totalRecordingCount = result.count;
          this.recordings = result.rows;
        } catch (e) {
          //
        }
        this.loading = false;
      }
    },
  },
  watch: {
    recordingsQuery() {
      // TODO(jon): Make sure we allow inactive devices to show recordings.
      this.fetchRecordings();
    },
  },
};
</script>

<style lang="scss">
.device-health {
  color: darkgray;
  &.healthy {
    color: #dc3545;
  }
}
.table-okay {
  border-left: 10px solid #cff1d7;
}
.table-warn {
  border-left: 10px solid #eecccf;
}
</style>
