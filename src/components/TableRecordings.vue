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
    <template
      slot="other"
      slot-scope="{item: { other: { batteryLevel }}}">
      <template v-if="batteryLevel">
        <font-awesome-icon icon="battery-three-quarters"/>
        {{ batteryLevel }}%
      </template>
    </template>
  </b-table>
</template>

<script>
export default {
  name: 'TableRecordings',
  props: {
    items: {
      type: Array,
      required: true
    }
  },
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
    };
  }
};
</script>

<style scoped>

.recording-table {
  padding-top: 15px
}

</style>
