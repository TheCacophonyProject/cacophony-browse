<template>
  <b-link
    :to="link"
    :class="position">
    <font-awesome-icon
      :icon="icon"
      :class="colour"
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
      default: null,
    },
    colour: {
      type: String,
      default: 'green',
    },
    position: {
      type: String,
      default: '',
    }
  }
};
</script>

<style scoped>
  .right {
    display: flex;
    margin-left: auto;
  }

  .green {
    color: #28a745;
  }

  .red {
    color: darkred;
  }
</style>
