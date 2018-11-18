<template>
  <b-form-group label="y-Axis Scale">
    <b-button-group :vertical="vertical">
      <b-btn
        v-for="(type, index) in types"
        :key="index"
        :variant="variant(type.value)"
        @click="$emit('input', type.value)">
        {{ type.text }}
      </b-btn>
    </b-button-group>
  </b-form-group>
</template>

<script>

export default {
  name: 'ScaleChoice',
  props: {
    value: {
      type: Boolean,
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
        {text: 'Linear', value: false},
        {text: 'Logarithmic', value: true},
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
