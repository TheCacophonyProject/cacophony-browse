<template>
  <b-table
    :items="items"
    :fields="fields"
    striped
    hover
    responsive
    class="recording-table">
    <template
      slot="view"
      slot-scope="row">
      <b-button
        :to="'/video/' + row.item.id"
        target="_blank">
        View
      </b-button>
    </template>
  </b-table>
</template>

<script>

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'TableRecordings',
// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
props: {
  items: {
    type: Array,
    required: true
  }
},
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data () {
    return {
      fields: [
        {
          key: 'view',
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
}
</script>

<style scoped>

.recording-table {
  padding-top: 15px
}

</style>
