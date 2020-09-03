<template>
  <b-form-group>
    <label>Device</label>
    <multiselect
      :value="selectedValues"
      :options="options"
      :multiple="true"
      :placeholder="placeholder"
      :disabled="!fetched"
      track-by="id"
      label="name"
      @input="$emit('input', $event)"
      data-cy="device-select"
    />
  </b-form-group>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "SelectDevice",
  props: {
    value: {
      type: Array,
      required: true
    }
  },
  computed: {
    placeholder: function() {
      if (!this.fetched) {
        return "loading";
      } else if (this.value.length > 0) {
        return "add more devices";
      } else {
        return "all devices";
      }
    },
    ...mapState({
      fetched: state => state.Devices.fetched,
      devices: state =>
        state.Devices.devices.map(device => {
          return {
            id: device.id,
            name: device.devicename
          };
        }),
      groups: state =>
        state.Groups.groups.map(group => {
          return {
            id: "group" + group.id,
            name: group.groupname + " (group)",
            devices: group.Devices
          };
        })
    }),
    selectedValues: function() {
      // Allow the devices to just be defined by ids if we haven't already fetched
      // the device labels etc. by the time the parent component initialises this one,
      // supporting the use-case where we're re-populating this from a shared url.

      // Gather a list of devices that belong to selected groups.
      const groupDevices = this.value
        .filter(id => typeof id === "string")
        .map(groupId => this.groups.find(({ id }) => groupId === id))
        .filter(item => item !== undefined)
        .reduce((acc, group) => [...acc, ...group.devices], []);

      return this.value
        .map(device => {
          if (typeof device === "number") {
            // This is a device id:
            return this.devices.find(({ id }) => device === id);
          } else if (typeof device === "string") {
            // This is a group id:
            return this.groups.find(({ id }) => device === id);
          } else {
            return device;
          }
        })
        .filter(
          device =>
            device !== undefined &&
            // Remove items that belong to any selected groups:
            groupDevices.find(groupDevice => groupDevice.id === device.id) ===
              undefined
        );
    },
    options: function() {
      return this.devices.concat(this.groups);
    }
  },
  created: async function() {
    await this.$store.dispatch("Devices/GET_DEVICES");
    await this.$store.dispatch("Groups/GET_GROUPS");
  }
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
