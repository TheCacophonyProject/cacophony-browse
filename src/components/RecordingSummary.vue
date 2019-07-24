<template>
  <div
    class="recording-summary"
    @click="e => navigateToRecording(item.id)"
  >
    <div class="recording-type">
      <span v-if="item.type === 'audio'">
        <font-awesome-icon
          :icon="['far', 'file-audio']"
          size="2x"
        />
      </span>
      <span v-else-if="item.type === 'thermalRaw'">
        <font-awesome-icon
          :icon="['far', 'file-video']"
          size="2x"
        />
      </span>
    </div>
    <div class="recording-main">
      <div class="recording-details">
        <h3 class="recording-title">
          <a
            :href="`/recording/${item.id}`"
            class="record-link"
          >
            {{ item.id }}
          </a>
        </h3>
        <span class="recording-group">
          <font-awesome-icon
            icon="users"
            size="xs"
          />
          {{ item.groupname }}
        </span>
        <span class="recording-device">
          <font-awesome-icon
            icon="microchip"
            size="xs"
          />
          {{ item.devicename }}
        </span>
      </div>
      <div
        v-if="item.tags.length !== 0"
        class="recording-tags"
      >
        <span
          v-for="(tag, index) in item.tags"
          :key="index"
          :class="[
            'tag',
            'badge',
            tag.class
          ]"
        >
          <!-- TODO: Change icon when info is available from API about whether tag was applied by human or AI -->
          <span class="tag-icon">
            <font-awesome-icon
              icon="cog"
              size="xs"
            />
          </span>
          <span class="tag-label">{{ tag.text }}</span>
        </span>
      </div>
      <div class="recording-time-duration">
        <div class="recording-time">
          <font-awesome-icon
            :icon="['far', 'calendar']"
            size="xs"
          />
          {{ item.date }} {{ item.time }}
        </div>
        <div class="recording-duration">
          <font-awesome-icon
            :icon="['far', 'clock']"
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
      </div>
    </div>
    <div
      v-if="item.location !== '(unknown)'"
      class="recording-location"
    >
      <!-- NOTE: Temporary link to google maps while we figure out a good source for a mapping thumbnail service  -->
      <a
        :href="`https://www.google.com/maps/@${item.location.replace(' ', '')},16z`"
        target="_blank"
        @click.stop.prevent="({currentTarget: {href, target}}) => window.open(href, target)"
      >
        <img
          alt="View location"
          src=""
        >
      </a>
    </div>
  </div>
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
    },
    window: {
      get() {
        return window;
      }
    }
  },
  methods: {
    navigateToRecording(recordingId) {
      this.$router.push({
        path: `recording/${recordingId}`,
      });
    }
  }
};
</script>

<style scoped lang="scss">
  @import "~bootstrap/scss/functions";
  @import "~bootstrap/scss/variables";
  @import "~bootstrap/scss/mixins";

  $recording-side-padding: 0.9rem;

  .svg-inline--fa {
    color: $gray-600;
  }

  // the wrapper of the recording
  .recording-summary {
    display: flex;
    flex-flow: row nowrap;
    border: 1px solid $border-color;
    margin-bottom: 1rem;
    cursor: pointer;
  }

  // wrapper of the icon on the left
  .recording-type {
    padding: 0.8rem $recording-side-padding;
    background: $gray-100;
    @include media-breakpoint-up(sm) {
      padding: 1rem 1.1rem;
    }
    flex: 0 1 auto;
    .fa-2x {
      font-size: 1.5em;
    }
  }

  // main content in the middle
  .recording-main {
    flex: 1 1 auto;
    display: flex;
    flex-flow: column nowrap;
    min-height: 110px;
    .svg-inline--fa { // set a fixed width on fontawesome icons so they align neatly when stacked
      width: 16px;
    }
    .recording-details {
      flex: 1 1 auto;
      padding: 0.7rem $recording-side-padding;
      .recording-title,
      .recording-group,
      .recording-device { // all elements that are the direct descendants of this div
        display: inline-block;
        word-break: break-word;
        margin-right: 0.8rem;
        @include media-breakpoint-down(xs) {
          display: block;
        }
      }
      .recording-title {
        margin-bottom: 0;
        font-size: 110%;
      }
      .recording-group,
      .recording-device {
        font-size: 95%;
        margin-right: 0.5rem;
      }
    }

    .recording-tags {
      padding: 0 $recording-side-padding 0.9rem;
      margin-top: -0.4rem;
      .tag {
        &.badge {
          font-weight: initial;
          font-size: 90%;
          color: $white;
          background: $secondary;
          margin-right: 0.3rem;
          line-height: 0.7;
        }
        &.text-danger,
        &.text-success {
          color: $white !important; //argh.
        }
        &.text-danger {
          background: $danger;
        }
        &.text-success {
          background: $success;
        }
        .svg-inline--fa {
          color: $white;
        }
      }

    }
    .recording-time-duration {
      display: flex;
      flex-flow: row wrap;
      border-top: 1px solid $border-color;
      > div {
        padding: 0.5rem $recording-side-padding;
        font-size: 80%;
      }
      .recording-duration,
      .recording-battery {
        border-left: 1px solid $border-color;
      }
      .recording-duration {
        margin-right: auto;
      }
      @include media-breakpoint-down(xs) {
        .recording-time {
          width: 100%;
          border-bottom: 1px solid $border-color;
        }
        .recording-duration {
          border-left: none;
        }
      }
    }
  }

  // map
  .recording-location {
    flex: 0 1 110px;
    min-width: 109px;
    text-align: center;
    background: $gray-100;
    @include media-breakpoint-between(xs,sm) {
      display: none;
    }
  }
</style>
