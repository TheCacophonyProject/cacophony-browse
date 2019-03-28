<template>
  <b-row class="wrapper">
    <b-row class="recording-summary">
      <b-col class="recording-type">
        <span v-if="item.type === 'audio'">
          <font-awesome-icon
            :icon="['far', 'file-audio']"
            :style="{ color: '#666' }"
            size="2x"
            transform="down-9"
          />
        </span>
        <span v-else-if="item.type === 'thermalRaw'">
          <font-awesome-icon
            :icon="['far', 'file-video']"
            :style="{ color: '#666' }"
            size="2x"
            transform="down-9"
          />
        </span>
      </b-col>
      <b-col>
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
        <b-row class="recording-tags">
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
            {{ item.duration }}
          </div>
        </b-row>
      </b-col>
      <b-col v-if="item.location !== '(unknown)'">{{ item.location }}</b-col>
    </b-row>
  </b-row>
</template>

<script>
export default {
  name: "RecordingSummary",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  methods: {
    trace: function () {
      console.log(this.item);
    }
  }
};
</script>

<style scoped>
  .recording-summary {
    max-width: 635px;
    min-width: 635px;
    color: #333;
    border: 1px solid #eee;
    font-size: 14px;
  }
  .record-link {
    font-size: 115%;
    font-weight: bold;
  }
  .recording-type {
    background: #f2f2f2;
    max-width: 52px;
    min-width: 52px;
  }
  .recording-type > span {
    display: inline-block;
    height: 100%;
  }
  .wrapper {
    width: 100%;
    justify-content: center;
    margin: 15px 0;
  }
  .recording-tags {
    border-bottom: 1px solid #eee;
  }
  .recording-tags, .recording-details, .recording-time, .recording-duration {
    padding: 0 16px;
    line-height: 150%;
  }
  .recording-time {
    border-right: 1px solid #eee;
  }
  .time-duration {
    font-size: 85%;
  }
  .time-duration > div {
    width: 50%;
  }
  .tag {
    border-radius: 3px;
    font-size: 85%;
    padding: 0 5px 0 0;
  }
  .tag-label {
    text-transform: capitalize;
    vertical-align: text-bottom;
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
    vertical-align: text-bottom;
  }
  .tag.text-danger {
    background: #db0a24;
  }
</style>
