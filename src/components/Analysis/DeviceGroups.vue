<template>
  <b-form-group label="Device Groups">
    <b-form-select
      :value="value"
      :options="options"
      @input="$emit('input', $event)"/>
  </b-form-group>
</template>

<script>
export default {
  name: "DeviceGroups",
  props: {
    value: {
      type: [String, Number],
      required: true
    },
    allGroups: {
      type: Array,
      required: true
    }
  },
  computed: {
    options: function() {
      const options = [
        {
          value: "all",
          text: "All Groups"
        }
      ];
      this.allGroups.forEach(group => {
        options.push({
          value: group.id,
          text: group.name
        });
      });
      return options;
    }
  }
};
</script>
