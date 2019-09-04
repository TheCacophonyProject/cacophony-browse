<template>
  <font-awesome-icon
    v-show="fetching"
    class="fa-spin"
    icon="cog"
    size="4x"
  />
</template>

<script>
export default {
  name: "Spinner",
  props: {
    fetching: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style scoped>
.fa-spin {
  color: #f5f5f5;
  margin: 1rem auto;
  display: flex;
}
</style>
