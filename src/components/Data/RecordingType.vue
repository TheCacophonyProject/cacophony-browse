<template>
  <b-button-group 
    :vertical="vertical" 
    class="my-1">
    <b-btn
      v-for="(type, index) in types"
      :key="index"
      :variant="variant(type.value)"
      active
      @click="$emit('input', type.value)">
      {{ type.text }}
    </b-btn>
  </b-button-group>
</template>

<script>

export default {
  name: 'RecordingType',
  props: {
    value: {
      type: String,
      required: true
    },
    vertical: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      types: [
        {text: 'Video', value: 'video'},
        {text: 'Audio', value: 'audio'},
        {text: 'Video & Audio', value: 'both'},
      ]
    };
  },
  methods: {
    variant(buttonValue) {
      if (buttonValue === this.value) {
        return 'primary';
      } else {
        return 'secondary';
      }
    }
  }
};
</script>
