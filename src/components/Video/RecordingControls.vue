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

        <b-col
          sm="3">
          <b-button-group
            v-b-tooltip.hover.bottomleft="'Download the files for this recording'"
            class="btn-block">
            <b-dropdown
              text="Download"
              right
              class="btn-block">
              <b-dropdown-item
                :href="downloadFileUrl"
                target="_blank">
                MP4
              </b-dropdown-item>
              <b-dropdown-item
                :href="downloadRawUrl"
                target="_blank">
                CPTV
              </b-dropdown-item>
            </b-dropdown>
          </b-button-group>
        </b-col>

        <b-col
          sm="3">
          <b-button
            v-b-tooltip.hover.bottomleft="'Delete this recording'"
            :disabled="deleteDisabled"
            variant="danger"
            block
            @click="deleteRecording()">
            Delete
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
import api from '../../api/index';

export default {
  name: 'RecordingControls',
  props: {
    items: {
      type: Array,
      required: true
    },
    downloadRawUrl: {
      type: String,
      default: "",
    },
    downloadFileUrl: {
      type: String,
      default: "",
    }
  },
  data () {
    return {
      fields: [
        {key: 'whatDetail', label: 'What'},
        {key: 'who', label: 'By'},
        {key: 'when', label: 'When'},
        {key: 'deleteButton', label: ''}
      ],
      deleteDisabled: false
    };
  },
  computed: {
  },
  watch: {
    items: function () {
      this.deleteDisabled = false;
    }
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
    },
    async deleteRecording() {
      this.deleteDisabled = true;
      const {success} = await api.recording.del(this.$route.params.id);
      if(success) {
        this.$emit('nextOrPreviousRecording');
      }
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
