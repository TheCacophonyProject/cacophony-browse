<template>
  <b-col>
    <b-button 
      class="basicTags" 
      @click="basicTag('unknown')">Unknown</b-button>
    <b-button 
      class="basicTags" 
      @click="basicTag('nothing of interest')">Nothing of interest</b-button>
    <b-button 
      class="basicTags" 
      @click="basicTag('bird')">Bird</b-button>
    <b-button 
      class="basicTags" 
      @click="basicTag('human')">Human</b-button>
  </b-col>
</template>

<script>
/* eslint-disable no-console */
export default {
  name: 'BasicTag',
  methods: {
    basicTag(tagValue) {      
      const tag = {};
      tag.tagValue = tagValue;
      tag.confidence = 0.5;
      tag.startTime = 0.5;
      tag.duration = 0.5;
      tag.automatic = false;    
      this.$emit('addAudioTag', tag);
    }
  },
};
</script>

<style scoped>
  .basicTags{
    margin: 5px;
  }
</style>
