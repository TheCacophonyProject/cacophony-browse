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
    this.allDevices();
  },
  methods: {
    allDevices: function () {
      return new Promise((resolve, reject) => {
        api.device.allDevices(this.$store.state.User.JWT)
          .then(response => response.json())
          .then((json) => {
            if(!json.success) {
              reject(json);
            }
            let rows = json.devices.rows;
            rows.map((row) => {
              let option = {
                id: row.id,
                name: row.devicename
              };
              this.options.push(option);
            });
            resolve(json);
          });
      });
    }
  }
};

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
