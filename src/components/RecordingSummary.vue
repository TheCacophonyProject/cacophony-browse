<template>
  <b-row
    class="recording-summary"
    @click="e => navigateToRecording(item.id)"
  >
    <b-col class="recording-type">
      <span v-if="item.type === 'audio'">
        <font-awesome-icon
          :icon="['far', 'file-audio']"
          :style="{ color: '#666' }"
          size="2x"
        />
      </span>
      <span v-else-if="item.type === 'thermalRaw'">
        <font-awesome-icon
          :icon="['far', 'file-video']"
          :style="{ color: '#666' }"
          size="2x"
        />
      </span>
    </b-col>
    <b-col class="recording-main">
      <b-row class="recording-details">
        <a
          :href="`/recording/${item.id}`"
          class="record-link"
        >
          {{ item.id }}
        </a>
        <span>
          <font-awesome-icon
            :style="{ color: '#666' }"
            icon="users"
            size="xs"
          />
          {{ item.groupname }}
        </span>
        <span>
          <font-awesome-icon
            :style="{ color: '#666' }"
            icon="microchip"
            size="xs"
          />
          {{ item.devicename }}
        </span>
      </b-row>
      <b-row
        v-if="item.tags.length !== 0"
        class="recording-tags"
      >
        <div
          v-for="(tag, index) in item.tags"
          :key="index"
          :class="[
            'tag',
            tag.class
          ]"
        >
          <span class="tag-icon">
            <font-awesome-icon
              icon="cog"
              size="xs"
            />
          </span>
          <span class="tag-label">{{ tag.text }}</span>
        </div>
      </b-row>
      <b-row class="time-duration">
        <div class="recording-time">
          <font-awesome-icon
            :icon="['far', 'calendar']"
            :style="{ color: '#666' }"
            size="xs"
          />
          {{ item.date }} {{ item.time }}
        </div>
        <div class="recording-duration">
          <font-awesome-icon
            :icon="['far', 'clock']"
            :style="{ color: '#666' }"
            size="xs"
          />
          {{ item.duration }} seconds
        </div>
        <div
          v-if="hasBattery"
          class="recording-battery"
        >
          <BatteryLevel :battery-level="item.other.batteryLevel" />
        </div >
      </b-row>
    </b-col>
    <b-col
      v-if="item.location !== '(unknown)'"
      class="recording-location"
    >
      {{ item.location }}
    </b-col>
    <!-- TODO: Something with processing state visually? -->
  </b-row>
</template>

<script>
import BatteryLevel from "./BatteryLevel.vue";
export default {
  name: "RecordingSummary",
  components: {BatteryLevel},
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    hasBattery() {
      return this.item.other && this.item.other.batteryLevel;
    }
  },
  methods: {
    navigateToRecording(recordingId) {
      this.$router.push({
        path: `recording/${recordingId}`,
      });
    },

  }
};
</script>

<style scoped>

  .recording-summary {
    color: #333;
    border: 1px solid #eee;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.3s;
    --internal-border-color: #eee;
    min-height: 109px;
  }
  .recording-details > * {
    padding-right: 15px;
  }
  .recording-summary:hover {
    border: 1px solid #999;
    box-shadow: 0 0 2px #999;
  }
  .record-link {
    font-size: 115%;
    font-weight: bold;
  }
  .recording-type {
    background: #f2f2f2;
    max-width: 52px;
    min-width: 52px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .recording-location {
    max-width: 109px;
    border-left: 1px solid var(--internal-border-color);
  }
  .recording-main {
    justify-content: space-between;
    display: flex;
    flex-direction: column;
  }
  .recording-tags, .recording-details, .recording-time, .recording-duration, .recording-battery {
    padding: 0 16px;
    line-height: 33px;
  }
  .recording-time {
    border-right: 1px solid var(--internal-border-color);
  }
  .recording-battery {
    border-left: 1px solid var(--internal-border-color);
  }
  .time-duration {
    font-size: 85%;
    border-top: 1px solid var(--internal-border-color);
  }
  .time-duration > div {
    flex-grow: 1;
    flex-basis: 33%;
  }
  .time-duration > div.recording-battery {
    flex-grow: 1;
    flex-basis: 10%;
  }
  .tag {
    border-radius: 3px;
    font-size: 85%;
    padding: 0 5px 0 0;
    line-height: 18px;
  }
  .tag-label {
    text-transform: capitalize;
    color: white;
  }
  .tag-icon {
    color: white;
    padding: 0 3px;
    background: rgba(255, 255, 255, 0.3);
    opacity: 0.9;
    display: inline-block;
    height: 100%;
    width: 18px;
    text-align: center;
  }
  .tag.text-danger {
    background: #db0a24;
  }
</style>
