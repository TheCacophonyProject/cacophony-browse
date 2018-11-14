<template>
  <b-btn
    block
    class="my-1"
    variant="success"
    @click="$emit('update')">
    Update Graph
  </b-btn>
</template>

<script>

export default {
  name: 'UpdateGraphButton'
};
</script>
