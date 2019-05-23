<template>
  <div >
    <b-form-input 
      v-model="customTagValue"
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
      customTagValue:''
    };
  },
  methods: {
    addCustomTag() {
      if((String.trim(this.customTagValue)).length == 0) {
        return;
      } 
      const tag = {};
      tag.tagValue = this.customTagValue;
      tag.confidence = 0.5;
      tag.startTime = 0.5;
      tag.duration = 0.5;
      tag.automatic = false;                
      this.$emit('addAudioTag', tag);
    },    
  }
};
</script>

<style scoped>
 
</style>
