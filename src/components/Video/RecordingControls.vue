<template>
  <div>
    <div class="video-tags">
      <b-row class="pt-2">
        <b-col
          sm="3">
          <b-button
            v-b-tooltip.hover.bottomleft="'Mark this as a cool or interesting recording'"
            type="button"
            variant="success"
            block
            @click="addCoolTag">
            Cool
          </b-button>
        </b-col>
        <b-col
          sm="3">
          <b-button
            v-b-tooltip.hover.bottomleft="'Indicate that one or more animals do not have a corresponding track in this recording'"
            type="button"
            variant="warning"
            block
            @click="addMissedTrackTag">
            Missed track
          </b-button>
        </b-col>
      </b-row>

      <b-table
        v-if="items.length > 0"
        id="tags-table"
        :items="items"
        :fields="fields"
        class="pt-3"
        striped
        hover
        responsive>
        <template
          slot="whatDetail"
          slot-scope="row">
          {{ whatDetail(row.item) }}
        </template>
        <template
          slot="deleteButton"
          slot-scope="row">
          <font-awesome-icon
            v-b-tooltip.hover.left="'Delete'"
            icon="trash"
            size="2x"
            style="cursor: pointer;"
            @click="$emit('deleteTag', row.item.tag.id)"/>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecordingControls',
  props: {
    items: {
      type: Array,
      required: true
    },
  },
  data () {
    return {
      fields: [
        {key: 'whatDetail', label: 'What'},
        {key: 'who', label: 'By'},
        {key: 'when', label: 'When'},
        {key: 'deleteButton', label: ''}
      ]
    };
  },
  computed: {
  },
  methods: {
    addCoolTag: function () {
      this.$emit('addTag', {
        detail: "cool",
        confidence: 0.9
      });
    },
    addMissedTrackTag: function () {
      this.$emit('addTag', {
        detail: "missed track",
        confidence: 0.9
      });
    },
    whatDetail: function (item) {
      return sentenceCase(item.what || item.detail || "-");
    }
  }
};

function sentenceCase(s) {
  if (s.length > 0) {
    return s[0].toUpperCase() + s.substr(1).toLowerCase();
  }
  return "";
}
</script>

<style scoped>
.video-tags {
  position: relative;
}
</style>
