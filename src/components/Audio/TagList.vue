<template>
  <div>
    <h2 class="tags-header">List of Audio Tags</h2>
    <b-table/>  
    <!--

      slot-scope - reference for parent template to refer to child template slots
      v-html inject html

      -->
    <template 
      v-if="items.length > 0"
      slot="tag"
      slot-scope="row" 
      :items="items"
      :fields="fields" >        
      <span v-html="(row.fields.tagType, row.item.tagType)"/>
    </template>
    <b-table/>
  </div>
</template>

<script>
export default {
  name: 'TagList',
  data () {
    return {
      fields: [
        {key: 'tagType', label: 'type'},
        {key: 'timeAt', label: 'tagged On'} 
      ]
    };
  },
  methods:{
    addTag(tag){
      
    }
  }
};

</script>


<style scoped>
.tags-header {
  margin-top: 20px;
}


</style>