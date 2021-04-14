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
      :items="devices"
      :fields="[
        {
          key: 'deviceName',
          label: 'Device Name',
          sortable: true,
        },
      ]"
      sort-by="devicename"
      hover
      outlined
      responsive
      data-cy="devices-table"
    >
      <template v-slot:cell(devicename)="row">
        <b-link
          :to="{
            name: 'device',
            params: { devicename: row.item.deviceName, groupname: groupName },
          }"
        >
          {{ row.item.deviceName }}
        </b-link>
      </template>
    </b-table>
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
  computed: {
    groupHasDevices() {
      return this.devices.length !== 0;
    },
  },
};
</script>

<style scoped></style>
