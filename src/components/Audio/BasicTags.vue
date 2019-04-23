<template>
  <div class="pt-1">
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
  </div>
</template>

<script>
export default {
  name: 'BasicTag',
  methods: {
    basicTag(tagType) {
      const tag = {};
      tag.type = tagType;
    }
  }
};
</script>

<style scoped>
  .basicTags{
    margin: 5px;
  }
</style>
