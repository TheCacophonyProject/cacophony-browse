<template>
  <div>
    <h2 class="tags-header">List of Tags</h2>
    <div 
      v-if="items.length == 0" 
      class="no-tags">
      There are no audio tags for this recording
    </div>


    <ul
      v-if="items.length > 0"
      :items="items"
      striped
      hover
      responsive />
    
    <li
      v-for="item in items" 
      :items="items"
      :key="item.id">
      {{ item.animal }} {{ item.who }} {{ item.when }}
    </li>
    <ul/>
  </div>
</template>

<script>

export default {
  name: 'TagList',
  props: {
    items: {
      type: Array,
      required: true
    },
  },  
  methods:{
  }
};

</script>


<style scoped>
.tags-header {
  margin-top: 20px;
}


</style>