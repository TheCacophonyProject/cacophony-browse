<template>
  <div >
    <b-form-input 
      v-model="customTagValue"
      class="w-50 mt-4 d-inline align-bottom" 
      placeholder="Enter custom tag"/>
    <b-button 
      class="mt-0" 
      @click="addCustomTag()">Add</b-button>
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
      // eslint-disable-next-line no-console
      console.log("here again");
      if(((this.customTagValue).trim()).length == 0) {
        this.customTagValue = "";
        return;
      } 
      const tag = {};
      tag.animal = this.customTagValue;
      tag.confidence = 0.5;
      tag.startTime = 0.5;
      tag.duration = 0.5;
      tag.automatic = false;                
      this.$emit('addAudioTag', tag);
      this.customTagValue = "";
    },    
  }
};
</script>

<style scoped>
 
</style>
