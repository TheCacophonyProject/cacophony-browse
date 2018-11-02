<template>
  <b-link
    :to="link"
    class="link-button">
    <font-awesome-icon
      :icon="icon"
      size="2x"
      style="cursor: pointer;"/>
  </b-link>
</template>

<script>
export default {
  name: "IconLink",
  props: {
    icon: {
      type: Object,
      required: true
    },
    link: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
  .link-button {
    color: #28a745;
    display: flex;
    margin-left: auto;
  }
</style>
