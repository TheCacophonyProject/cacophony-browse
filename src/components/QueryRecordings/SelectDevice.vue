<template>
  <b-form-group>
    <label>Device</label>
    <multiselect
      :value="value"
      :options="options"
      :multiple="true"
      :placeholder="placeholder"
      track-by="id"
      label="name"
      @input="$emit('input', $event)"
    />
  </b-form-group>
</template>

<script>

export default {
  name: 'SelectDevice',
  props: {
    value: {
      type: Array,
      required: true
    }
  },
  computed: {
    placeholder: function () {
      if (this.value.length > 0) {
        return "add more devices";
      } else {
        return "all devices";
      }
    },
    options: function () {
      this.$store.dispatch('Devices/GET_DEVICES');
      return this.$store.state.Devices.devices.map(device => {
        return {id: device.id, name: device.devicename};
      });
    }
  }
};

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
