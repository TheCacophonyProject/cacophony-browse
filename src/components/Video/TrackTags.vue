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
      <!-- Be careful about changing the tooltips to use a placement
           other than "left" here. This can cause the tooltips to be
           positioned badly, causing flickering and leads to other
           problems:

           - https://github.com/TheCacophonyProject/cacophony-browse/issues/180
           - ttps://github.com/TheCacophonyProject/cacophony-browse/issues/185
        -->
      <template
        slot="deleteButton"
        slot-scope="row">
        <font-awesome-icon
          v-b-tooltip.left="'Delete tag'"
          v-if="!row.item.automatic"
          icon="trash"
          style="cursor: pointer;"
          size="2x"
          @click="$emit('deleteTag', row.item)"/>
      </template>
      <template
        slot="confirmButton"
        slot-scope="row">
        <font-awesome-icon
          v-b-tooltip.left="'Confirm the automatic tag'"
          v-if="row.item.automatic"
          icon="check-circle"
          style="cursor: pointer;"
          size="2x"
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
        {key: 'what', label: 'Tags', variant: 'what'},
        {key: 'confidence', label: ''},
        {key: 'who', label: ''},
        {key: 'deleteButton', label: '', variant: 'delete'},
        {key: 'confirmButton', label: '', variant: 'confirm'}
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
</style>

<style>
  td.table-delete,
  td.table-confirm {
    padding: 6px;
  }

  td.table-what {
    padding: 0px;
  }
</style>
