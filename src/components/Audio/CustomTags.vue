<template>
  <div >
    <b-form-input 
      v-model="text"
      class="w-50 mt-4 d-inline align-bottom" 
      placeholder="Enter custom tag"/>
    <b-button class="mt-0">Apply</b-button>
  </div>
</template>

<script>
export default {
  name: 'CustomTag',
  data: function() {
    return {
      text:''
    };
  },
  methods: {
    customTag(customTag) {
      const tag = {};
      tag.type = customTag;
    }
  }
};
</script>

<style scoped>
 
</style>
