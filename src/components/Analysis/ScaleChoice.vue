<template>
  <b-btn
    :pressed="value"
    variant="outline-secondary"
    size="sm"
    @click="$emit('input', !value)"
  >
    Log Scale
  </b-btn>
</template>

<script>
export default {
  name: "ScaleChoice",
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data: function() {
    return {
      types: [
        { text: "Log", value: false },
        { text: "Log", value: true }
      ]
    };
  },
  methods: {}
};
</script>

<style scoped>
b-btn {
  margin: 20px;
}
</style>
