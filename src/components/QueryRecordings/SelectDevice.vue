<template>
  <b-form-group v-if="fetched">
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

import {mapState} from 'vuex';

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
    ...mapState({
      fetched: state => state.Devices.fetched,
      options: state => state.Devices.devices.map(device => {
        return {id: device.id, name: device.devicename};
      })
    })
  },
  created: async function() {
    await this.$store.dispatch('Devices/GET_DEVICES');
  }
};

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
