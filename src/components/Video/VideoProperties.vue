<template>
  <div>
    <b-form>
      <b-form-group>
        <div
          v-for="prop of properties"
          :key="prop.key">
          <p v-if="recording.batteryLevel && prop.key === 'batteryLevel'">
            <strong>Battery Level: </strong><BatteryLevel :battery-level="recording.batteryLevel"/>
          </p>
          <p v-else-if="recording[prop.key]" >
            <strong>{{ prop.title }}:</strong> {{ recording[prop.key] }}
          </p>
        </div>
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
            @click="updateComment">Save</b-button>
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
          @click="deleteRecording()">Delete</b-button>
      </b-form-group>
      <b-alert
        :show="showDeleteAlert"
        variant="success"
        dismissible
        @dismissed="showDeleteAlert=false">Recording deleted.</b-alert>

    </b-form>

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
import config from '../../config';
import BatteryLevel from '../BatteryLevel.vue';

export default {
  name: 'VideoProperties',
  components: {
    BatteryLevel
  },
  props: {
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
    },
    recording: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      showCommentAlert: false,
      showDeleteAlert: false,
      properties: [
        {key: 'processingState', title: 'Processing State'},
        {key: 'location', title: 'Location'},
        {key: 'relativeToDusk', title: 'Relative to Dusk'},
        {key: 'relativeToDawn', title: 'Relative to Dawn'},
        {key: 'batteryLevel', title: 'Battery Level'},
        {key: 'batteryCharging', title: 'Battery Charging'},
        {key: 'airplaneModeOn', title: 'Airplane Mode'},
        {key: 'version', title: 'Version'},
        {key: 'additionalMetadata', title: 'Additional Metadata'}
      ]
    };
  },
  computed: {
    downloadRawUrl: function () {
      return `${config.api}/api/v1/signedUrl?jwt=${this.downloadRaw}`;
    },
    downloadFileUrl: function () {
      return `${config.api}/api/v1/signedUrl?jwt=${this.downloadFile}`;
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
