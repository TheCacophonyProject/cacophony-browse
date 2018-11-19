<template>
  <b-button-group size="sm">
    <b-btn
      v-for="(type, index) in types"
      :key="index"
      :variant="variant(type.value)"
      @click="$emit('input', type.value)">
      {{ type.text }}
    </b-btn>
  </b-button-group>
</template>

<script>

export default {
  name: 'ScaleChoice',
  props: {
    value: {
      type: Boolean,
      required: true
    },
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
