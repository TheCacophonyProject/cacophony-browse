<template>
  <b-table
  striped
  hover
  responsive
  v-bind:items="items"
  v-bind:fields="fields"
  class="recording-table"></b-table>
</template>

<script>

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'table-recordings',
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data () {
    return {
      fields: [
        {
          key: 'view_link',
          label: 'View'
        },
        {
          key: 'id'
        },
        {
          key: 'devicename',
          label: 'Device'
        },
        {
          key: 'groupname',
          label: 'Group'
        },
        {
          key: 'location'
        },
        {
          key: 'time'
        },
        {
          key: 'date'
        },
        {
          key: 'duration'
        },
        {
          key: 'tags'
        },
        {
          key: 'other'
        },
        {
          key: 'processing_state'
        },
      ]
    }
  },

// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
computed: {
},
// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
props: {
  items: Array
},
}
</script>

<style scoped>

.recording-table {
  padding-top: 15px
}

</style>
