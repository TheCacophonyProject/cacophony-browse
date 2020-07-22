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
      @input="updateSelected"
    />
  </b-form-group>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "SelectDevice",
  props: {
    selectedDevices: {
      type: Array,
      required: true
    },
    selectedGroups: {
      type: Array,
      required: true
    }
  },
  computed: {
    placeholder: function() {
      if (!this.fetched) {
        return "loading";
      } else if (this.selectedDevices.length == 0 && this.selectedGroups.length == 0) {
        return "all devices";
      } else {
        return "add more devices";
      }
    },
    ...mapState({
      fetched: state => state.Devices.fetched,
      devices: state =>
        state.Devices.devices.map(device => {
          return {
            id: 'D' + device.id,
            name: device.devicename
          };
        }),
      groups: state =>
        state.Groups.groups.map(group => {
          return {
            id: 'G' + group.id,
            name: group.groupname + " (group)",
            devices: group.Devices
          };
        })
    }),
    selectedValues: function() {
      const selectedDs = this.selectedDevices.map(deviceId => this.devices.find(({ id }) => 'D' + deviceId === id));
      const selectedGs = this.selectedGroups.map(groupId => this.groups.find(({ id }) => 'G' + groupId === id));
      return [...selectedDs, ...selectedGs];
    },
    options: function() {
      return this.devices.concat(this.groups);
    }
  },
  methods: {
    updateSelected(selectedObjects) {
      const devices = this.getIdsWithPrefix(selectedObjects, 'D');
      const groups = this.getIdsWithPrefix(selectedObjects, 'G');
      const updatedSelection = {
        devices: devices,
        groups: groups
      }
      // this causes the v-model in the parent component to get updated
      this.$emit('update-device-selection', updatedSelection);
    }, 

    getIdsWithPrefix(objects, prefix) {
      const prefixed =  objects.filter(item => item.id.substring(0, prefix.length) === prefix);
      return prefixed.map(item => parseInt(item.id.substring(prefix.length, item.id.length)));
    }    
  },
  created: async function() {
    await this.$store.dispatch("Devices/GET_DEVICES");
    await this.$store.dispatch("Groups/GET_GROUPS");
  }
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
