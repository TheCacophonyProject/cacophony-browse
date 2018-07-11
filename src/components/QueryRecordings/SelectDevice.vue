<template>
  <b-form-group>
    <label>Device</label>
    <multiselect
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-bind:options="options"
      v-bind:multiple="true"
      v-bind:placeholder="placeholder"
      track-by="id"
      label="name"
      ></multiselect>
  </b-form-group>
</template>

<script>

import api from '../../api/index'

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'device-select',
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data () {
    return {
      options: [
      ]
    }
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {
    placeholder: function () {
      if (this.value.length > 0) {
        return "add more devices"
      } else {
        return "all devices"
      }
    }
  },
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {value: Array},
  created: function () {
    this.allDevices()
  },
  methods: {
    allDevices: function () {
      return new Promise((resolve, reject) => {
        api.device.allDevices(this.$store.state.User.JWT)
        .then(response => response.json())
        .then((json) => {
          if(!json.success) {
            reject(json)
          }
          let rows = json.devices.rows
          rows.map((row) => {
            let option = {
              id: row.id,
              name: row.devicename
            }
            this.options.push(option)})
            resolve(json)
          })
        })
      }
    }
  }

  </script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
