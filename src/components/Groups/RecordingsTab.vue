<template>
  <div class="container" v-if="!loading">
    <h2>
      Devices - {{ groupName }}
      <help>
        Devices specify which group they belong to when they first register.
        They can't be edited here.
      </help>
    </h2>
    <div class="description-and-button-wrapper">
      <p v-if="groupHasDevices">Devices associated with this group.</p>
      <p v-else class="description-and-button-wrapper">
        There are currently no devices associated with this group.
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
      <template v-slot:cell(deviceHealth)="row">
        <span :class="[{ healthy: row.item.isHealthy }, 'device-health']">
          <font-awesome-icon
            v-if="row.item.isHealthy"
            icon="heart"
            class="icon"
          />
          <font-awesome-icon v-else icon="heart-broken" class="icon" />
        </span>
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import Help from "@/components/Help.vue";

export default {
  name: "RecordingsTab",
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
      return i.isHealthy.toString();
    },
  },
  computed: {
    groupHasDevices() {
      return this.devices.length !== 0;
    },
    tableItems() {
      return this.devices.map((device) => ({
        ...device,
        _rowVariant: device.isHealthy ? "okay" : "warn",
      }));
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
