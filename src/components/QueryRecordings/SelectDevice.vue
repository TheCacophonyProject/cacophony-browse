<template>
  <b-form-group>
    <label>Device</label>
    <multiselect
      :value="selectedValues"
      :options="options"
      :multiple="true"
      :placeholder="placeholder"
      :disabled="fetching"
      track-by="uid"
      label="name"
      @input="updateSelected"
      data-cy="device-select"
    >
      <template slot="tag" slot-scope="{ option, remove }">
        <span class="multiselect__tag">
          <font-awesome-icon
            v-if="option.type === 'group'"
            icon="users"
            size="xs"
          />
          <font-awesome-icon
            v-else-if="option.type === 'device'"
            icon="microchip"
            size="xs"
          />
          <span class="tag">{{ option.name }}</span>
          <span v-if="option.type === 'group'" class="tag">
            ({{ option.devices.length }} devices)
          </span>

          <i
            aria-hidden="true"
            tabindex="1"
            class="multiselect__tag-icon"
            @click="(_) => remove(option)"
            @keypress.enter.space="remove(option)"
          ></i>
        </span>
      </template>
      <template slot="option" slot-scope="{ option: { type, name } }">
        <span>
          <font-awesome-icon v-if="type === 'group'" icon="users" size="xs" />
          <font-awesome-icon
            v-else-if="type === 'device'"
            icon="microchip"
            size="xs"
          />
          <span class="option">{{ name }}</span>
        </span>
      </template>
    </multiselect>
  </b-form-group>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "SelectDevice",
  props: {
    selectedDevices: {
      type: Array,
      required: true,
    },
    selectedGroups: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      fetching: false,
    };
  },
  computed: {
    placeholder: function () {
      if (this.fetching) {
        return "loading";
      } else if (
        this.selectedDevices.length === 0 &&
        this.selectedGroups.length === 0
      ) {
        return "all devices";
      } else {
        return "add more devices";
      }
    },
    ...mapState({
      devices: (state) =>
        state.Devices.devices
          .map(({ id, devicename }) => ({
            id: Number(id),
            type: "device",
            name: devicename,
            uid: `device_${id}`,
          }))
          .reduce((acc, curr) => ((acc[curr.id] = curr), acc), {}),
      groups: (state) =>
        state.Groups.groups
          .map(({ id, groupname, Devices }) => ({
            id: Number(id),
            type: "group",
            name: groupname,
            devices: Devices,
            uid: `group_${id}`,
          }))
          // NOTE: Filter out empty groups
          .filter(({ devices }) => devices.length !== 0)
          .reduce((acc, curr) => ((acc[curr.id] = curr), acc), {}),
    }),
    selectedValues() {
      const selectedDs = this.selectedDevices
        .map((deviceId) => this.devices[deviceId])
        .filter((item) => item !== undefined);
      const selectedGs = this.selectedGroups
        .map((groupId) => this.groups[groupId])
        .filter((item) => item !== undefined);
      return [...selectedDs, ...selectedGs];
    },
    options() {
      return [...Object.values(this.devices), ...Object.values(this.groups)];
    },
  },
  methods: {
    updateSelected(selectedObjects) {
      const updatedSelection = {
        devices: selectedObjects
          .filter(({ type }) => type === "device")
          .map(({ id }) => id),
        groups: selectedObjects
          .filter(({ type }) => type === "group")
          .map(({ id }) => id),
      };
      // this causes the v-model in the parent component to get updated
      this.$emit("update-device-selection", updatedSelection);
    },
  },
  async created() {
    this.fetching = true;
    await Promise.all([
      this.$store.dispatch("Devices/GET_DEVICES"),
      this.$store.dispatch("Groups/GET_GROUPS"),
    ]);
    this.fetching = false;
  },
};
</script>
<style scoped>
.tag,
.option {
  vertical-align: middle;
}
</style>
