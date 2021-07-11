<template>
  <div class="container" v-if="!loading">
    <h2>
      Devices
      <help>
        Devices specify which group they belong to when they first register.
        They can't be edited here.
      </help>
    </h2>
    <div>
      <p v-if="groupHasDevices">
        Devices associated with <strong>{{ groupName }}</strong
        >:
      </p>
      <p v-else class="description-and-button-wrapper">
        There are currently no devices associated with
        <strong>{{ groupName }}</strong
        >.
      </p>
    </div>
    <b-table
      v-if="groupHasDevices"
      :items="tableItems"
      :fields="[
        {
          key: 'deviceName',
          label: 'Device Name',
          sortable: true,
        },
        {
          key: 'deviceHealth',
          label: 'Device Health',
          sortable: true,
          formatter: sortBool,
          sortByFormatted: true,
        },
        {
          key: 'type',
          label: 'Device Type',
          sortable: true,
        },
      ]"
      sort-by="devicename"
      hover
      outlined
      responsive
      data-cy="devices-table"
    >
      <template v-slot:cell(deviceName)="row">
        <b-link
          :to="{
            name: 'device',
            params: {
              deviceName: row.item.deviceName,
              groupName,
            },
          }"
        >
          {{ row.item.deviceName }}
        </b-link>
      </template>
      <template v-slot:cell(type)="row">
        <span>
          <b-spinner
            v-if="!row.item.type"
            class="spinner"
            type="border"
            small
          />
          <font-awesome-icon
            v-if="row.item.type === 'VideoRecorder'"
            icon="video"
            class="icon"
          />
          <font-awesome-icon
            v-else-if="row.item.type === 'AudioRecorder'"
            icon="music"
            class="icon"
          />
          <font-awesome-icon
            v-else-if="row.item.type === 'UnknownDeviceType'"
            icon="question"
            class="icon"
          />
        </span>
      </template>
      <template v-slot:cell(deviceHealth)="row">
        <span
          :class="[{ healthy: row.item.isHealthy }, 'device-health']"
          v-if="row.item.type === 'VideoRecorder'"
        >
          <font-awesome-icon
            v-if="row.item.isHealthy"
            icon="heart"
            class="icon"
          />
          <font-awesome-icon v-else icon="heart-broken" class="icon" />
        </span>
        <b-spinner v-if="!row.item.type" type="border" small />
        <font-awesome-icon
          v-else-if="row.item.type !== 'VideoRecorder'"
          icon="question"
          class="icon"
        />
      </template>
    </b-table>
    <div class="bottom-buttons">
      <b-button
        v-if="groupHasDevices"
        class="export-visits"
        @click="exportVisits"
      >
        <font-awesome-icon icon="download" class="fa-1x" />
        <span>Export TrapNZ Visits for devices</span>
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import Help from "@/components/Help.vue";

export default {
  name: "DevicesTab",
  components: {
    Help,
  },
  props: {
    isGroupAdmin: { type: Boolean, default: false },
    devices: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    groupName: { type: String, required: true },
  },
  methods: {
    sortBool(_v, _k, i) {
      return `${i.type}_${i.isHealthy}`;
    },
    exportVisits() {
      alert("To be implemented before release");
      return;
    },
  },
  computed: {
    groupHasDevices() {
      return this.devices.length !== 0;
    },
    tableItems() {
      return this.devices.map((device) => ({
        ...device,
        _rowVariant:
          device.type === "VideoRecorder"
            ? device.isHealthy
              ? "okay"
              : "warn"
            : "empty",
      }));
    },
  },
};
</script>

<style lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.device-health {
  color: #dc3545;
  &.healthy {
    color: #555;
  }
}
.table-okay {
  border-left: 10px solid #cff1d7;
}
.table-warn {
  border-left: 10px solid #eecccf;
}
.table-empty {
  border-left: 10px solid #ddd;
}
.spinner {
  color: #ccc;
}

@include media-breakpoint-up(md) {
  .bottom-buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
}
@include media-breakpoint-down(sm) {
  .bottom-buttons {
    display: flex;
    flex-direction: column;
    > * {
      margin-bottom: 10px;
    }
  }
}
</style>
