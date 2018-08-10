<template>
  <div>
    <h3>Video properties</h3>
    <b-form>
      <b-form-group
        label="Processing:"
        horizontal>
        <b-input
          :value="processingState"
          disabled />
      </b-form-group>

      <b-form-group
        label="Comment"
        horizontal>
        <b-form-row class="m-0">
          <b-form-textarea
            :value="value"
            class="col"
            @input="$emit('input', $event)" />
          <div class="col-md-1" />
          <b-button
            class="col-md-3"
            @click="updateComment">Save Comment</b-button>
        </b-form-row>
      </b-form-group>
      <b-alert
        :show="showCommentAlert"
        variant="success"
        dismissible
        @dismissed="showCommentAlert=false">Comment saved.</b-alert>

      <b-form-group>
        <b-button
          :block="true"
          variant="danger"
          @click="deleteRecording()">Delete Video</b-button>
      </b-form-group>
      <b-alert
        :show="showDeleteAlert"
        variant="success"
        dismissible
        @dismissed="showDeleteAlert=false">Recording deleted.</b-alert>

    </b-form>

    <h3>Download Files</h3>
    <b-button
      :href="downloadRawUrl"
      target="_blank">Download Raw</b-button>
    <b-button
      :href="downloadFileUrl"
      target="_blank">Download File</b-button>

  </div>
</template>

<script>

import api from '../../api/index';
import { Config } from '../../../app.config';

export default {
  name: 'VideoProperties',
  props: {
    processingState: {
      type: String,
      default: "incomplete"
    },
    value: {
      type: String,
      default: ""
    },
    downloadRaw: {
      type: String,
      default: ""
    },
    downloadFile: {
      type: String,
      default: ""
    }
  },
  data () {
    return {
      showCommentAlert: false,
      showDeleteAlert: false
    };
  },
  computed: {
    downloadRawUrl: function () {
      return `${Config.api}/api/v1/signedUrl?jwt=${this.downloadRaw}`;
    },
    downloadFileUrl: function () {
      return `${Config.api}/api/v1/signedUrl?jwt=${this.downloadFile}`;
    }
  },
  methods: {
    async updateComment() {
      const result = await api.recording.comment(this.value, this.$route.params.id);
      if(result.success) {
        this.showCommentAlert = true;
      }
    },
    async deleteRecording() {
      const result = await api.recording.del(this.$route.params.id);
      if(result.success) {
        this.showDeleteAlert = true;
        this.$emit('nextRecording');
      }
    }
  }
};
</script>

<style scoped>

</style>
