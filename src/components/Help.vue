<template>
  <span
    v-b-tooltip.hover="helpTip"
    class="float-right help">?</span>
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
        title: this.helpText.title,
        content: this.helpText.content
      }
    };
  }
};
</script>

<style scoped>
.help {
  color: #28a745;
}
</style>
