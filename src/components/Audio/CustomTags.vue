<template>
  <div >
    <b-form-input 
      v-model="text"
      class="w-50 mt-4 d-inline align-bottom" 
      placeholder="Enter custom tag"/>
    <b-button 
      class="mt-0" 
      @click="addCustomTag()">Apply</b-button>
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
    addCustomTag() {
      const tag = {};
      tag.type = this.text;
      this.$parent.addAudioTag(tag);
    }
  }
};
</script>

<style scoped>
 
</style>
