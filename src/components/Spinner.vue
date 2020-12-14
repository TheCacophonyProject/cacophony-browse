<template>
  <div class="spinner-wrapper" v-show="fetching">
    <font-awesome-icon class="fa-spin" icon="cog" size="4x" />
  </div>
</template>

<script>
export default {
  name: "Spinner",
  props: {
    fetching: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style scoped>
.spinner-wrapper {
  width: 100%;
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
}
.fa-spin {
  color: #f5f5f5;
  margin: 0 auto;
}
</style>
