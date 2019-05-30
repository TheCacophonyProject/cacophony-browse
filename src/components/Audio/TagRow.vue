<template>
  <b-row>
    <b-col>
      tag
    </b-col>
    <b-col>
      start time
    </b-col>
    <b-col>
      duration
    </b-col>    
  </b-row>
</template>
<script>

export default{
  name: "TagRow",
  props: {
    items: {
      type: Array,
      required: true
    },
  }
};
</script>
<style>


</style>