<template>
  <div>
    <b-table
      :items="items"
      :fields="fields"
      class="track-tag-table"
      striped
      hover
      responsive
      thead-class="d-none">
      <template
        slot="what"
        slot-scope="row">
        <div
          class="what-image"
          v-html="what(row.item.what)"/>
      </template>
      <template
        slot="who"
        slot-scope="row">
        <div
          v-if="row.item.User"
          v-html="row.item.User.username"/>
      </template>
      <template
        slot="deleteButton"
        slot-scope="row"
        class="delect-cell">
        <div
          v-b-popover.hover.bottom="'Delete tag'"
          class="delete-button"
          @click="$emit('deleteTag', row.item)">
          <font-awesome-icon
            v-if="!row.item.automatic"
            icon="trash"
            style="cursor: pointer;"/>
        </div>
      </template>
      <template
        slot="confirmButton"
        slot-scope="row">
        <font-awesome-icon
          v-b-popover.hover.bottom="'Confirm the automatic tag'"
          v-if="row.item.automatic"
          icon="check-circle"
          style="cursor: pointer;"
          @click="confirmTag(row.item)"/>
      </template>
    </b-table>
  </div>
</template>

<script>

/* global require */

export default {
  name: 'TrackTags',
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      fields: [
        {key: 'what', label: 'Tags'},
        {key: 'confidence', label: ''},
        {key: 'who', label: ''},
        {key: 'deleteButton', label: ''},
        {key: 'confirmButton', label: ''}
      ]
    };
  },
  computed: {
  },
  methods: {
    what: function (what) {
      // Struggling to get images to show correctly so using work-around
      // suggested at bottom of this page.
      // TODO implement alternative that doesn't use 'require' in this manner
      // https://bootstrap-vue.js.org/docs/reference/images/
      let image = null;
      if (what == 'false positive') {
        image = 'none.png';
      } else if (what == 'bird/kiwi') {
        image = 'kiwi.png';
      } else if (what == 'unidentified') {
        image = 'unknown.png';
      } else {
        image = what + '.png';
      }
      try {
        const link = require('../../assets/video/' + image);
        return `<img src="${link}"><div class="d-inline d-lg-block">${what}</div>`;
      } catch (e) {
        return `<img><div>${what}</div>`;
      }
    },
    confirmTag: function (rowItem) {
      const tag = {};
      tag.what = rowItem.what;
      tag.confidence = rowItem.confidence;
      this.$emit('addTag', tag);
    }
  },
};
</script>

<style scoped>
.what-image >>> img
{
  max-width: 30px;
  max-height: 30px;
}

.track-tag-table {
  font-size: 80%;
}

.track-tag-table >>> thead tr td {
  padding: 1px 0px;
}

table td .what-image,
table td .delete-button {
  margin: -12px;
}

.delete-button {
  padding: 12px;
}
</style>
