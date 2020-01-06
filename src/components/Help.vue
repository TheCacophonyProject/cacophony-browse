<template>
  <span v-b-tooltip.hover="helpTip" class="float-right help">
    <font-awesome-icon icon="question-circle" size="xs" />
  </span>
</template>

<script>
export default {
  name: "Help",
  props: {
    helpText: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      helpTip: {
        html: true,
        title: this.helpText.title
      }
    };
  }
};
</script>
