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

import api from '../../api/index';

export default {
  name: 'SelectDevice',
  props: {
    value: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      options: [
      ]
    };
  },
  computed: {
    placeholder: function () {
      if (this.value.length > 0) {
        return "add more devices";
      } else {
        return "all devices";
      }
    }
  },
  created: function () {
    this.getDevices();
  },
  methods: {
    async getDevices() {
      const response = await api.device.getDevices();

      const rows = response.devices.rows;
      rows.map((row) => {
        const option = {
          id: row.id,
          name: row.devicename
        };
        this.options.push(option);
      });

    }
  }
};

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
