<template>
  <div class="spinner-wrapper">
    <font-awesome-icon v-show="fetching" class="fa-spin" icon="cog" size="4x" />
  </div>
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
.spinner-wrapper {
  width: 100%;
  display: flex;
  top: 50%;
  transform: translateY(-50%);
}
.fa-spin {
  color: #f5f5f5;
  margin: 0 auto;
}
</style>
