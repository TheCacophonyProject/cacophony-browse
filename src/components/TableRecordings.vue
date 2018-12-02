<template>
  <b-table
    :items="items"
    :fields="fields"
    small
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
        <BatteryLevel :battery-level="batteryLevel"/>
      </template>
    </template>
    <template
      slot="tags"
      slot-scope="{item: {tags}}">
      <span
        v-for="(tag, index) in tags"
        :class="tag.class"
        :key="index">
        {{ tag.text }}<span v-if="index + 1 < tags.length">,</span>
      </span>
    </template>
  </b-table>
</template>

<script>

import BatteryLevel from './BatteryLevel.vue';

export default {
  name: 'TableRecordings',
  components: {
    BatteryLevel
  },
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
          label: 'Group',
          class: 'd-none d-lg-table-cell'
        },
        {
          key: 'location',
          class: 'd-none d-lg-table-cell'
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
          key: 'other',
          class: 'd-none d-lg-table-cell'
        },
        {
          key: 'processing_state',
          class: 'd-none d-lg-table-cell'
        },
      ]
    };
  },
  methods: {

  },
};
</script>

<style>
  td.table-xtra {
    color: red;
  }
  .recording-table {
    padding-top: 15px;
  }
</style>
