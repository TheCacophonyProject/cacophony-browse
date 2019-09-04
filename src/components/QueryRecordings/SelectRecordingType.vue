<template>
  <b-form-group>
    <label>Recording Type</label>
    <b-form-select
      :value="value"
      :options="options"
      @input="$emit('input', $event)"/>
  </b-form-group>
</template>

<script>
export default {
  name: "SelectRecordingType",
  props: {
    value: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      thisvalue: ["interesting", "possum"],
      options: [
        { value: "both", text: "Video and Audio" },
        { value: "audio", text: "Audio only" },
        { value: "video", text: "Video only" }
      ]
    };
  }
};
</script>

<style>
</style>
