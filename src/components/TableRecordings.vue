<template>
  <b-table
    :items="items"
    :fields="fields"
    striped
    hover
    responsive
    class="recording-table">
    <template
      slot="id"
      slot-scope="row">
      <a
        :href="'/recording/' + row.item.id"
        target="_blank">
        {{ row.item.id }}
      </a>
    </template>
    <template
      slot="type"
      slot-scope="{item: { type }}">
      <template v-if="type === 'audio'">
        <span title="Audio">
          <font-awesome-icon icon="music"/>
        </span>
      </template>
      <template v-else-if="type === 'thermalRaw'">
        <span title="Thermal video">
          <font-awesome-icon icon="video"/>
        </span>
      </template>
      <template v-else>
        {{ type }}
      </template>
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
          key: 'id',
          label: 'ID'
        },
        {
          key: 'type'
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
          key: 'date'
        },
        {
          key: 'time'
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
