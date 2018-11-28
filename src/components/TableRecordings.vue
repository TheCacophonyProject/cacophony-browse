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
        v-for="(tag, index) in parseTags(tags)"
        :class="tag.class"
        :key="index">
        {{ tag.text }}
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
    parseTags: function (tags) {
      // Build a collection of tagItems - one per animal
      const tagItems = {};
      for (const tag of tags) {
        const animal = tag.animal === null ? 'F/P' : tag.animal;
        if (!tagItems[animal]) {
          // Animal has not been seen yet
          tagItems[animal] = {};
        }
        if (tag.automatic) {
          tagItems[animal].automatic = true;
        } else {
          tagItems[animal].human = true;
        }
      }
      // Use automatic and human status to create an ordered array of objects
      // suitable for parsing into coloured spans
      const result = [];
      for (const animal of Object.keys(tagItems)) {
        const tagItem = tagItems[animal];
        if (tagItem.automatic && tagItem.human) {
          result.push({
            text: animal,
            class: 'text-success',
            order: 0
          });
        } else if (tagItem.human) {
          result.push({
            text: animal,
            class: '',
            order: 1
          });
        } else if (tagItem.automatic) {
          result.push({
            text: animal,
            class: 'text-danger',
            order: 2
          });
        }
      }
      // Sort the result array
      result.sort((a,b) => {
        return a.order - b.order;
      });
      // Add commas to the strings if appropriate
      result.forEach((item, index, array) => {
        if (index !== array.length - 1) {
          array[index].text = item.text + ',';
        }
      });
      return result;
    }
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
