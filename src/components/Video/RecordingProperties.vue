<template>
  <div>
    <b-form>
      <b-form-group>
        <div v-if="'user-entered' in recording.additionalMetadata">
          <h3>Properties</h3>
          <div
            v-for="(value, key) of recording.additionalMetadata['user-entered']"
            :key="key">
            <p>
              <strong>{{ key }}</strong>{{ value }}
            </p>
          </div>
        </div>

        <h3>Technical details &nbsp;
          <span
            v-if="!display"
            title="Show details"
            @click="display=true">
            <font-awesome-icon
              icon="angle-down"
              class="fa-1x"/>
          </span>
          <span
            v-if="display"
            title="Hide details"
            @click="display=false">
            <font-awesome-icon
              icon="angle-up"
              class="fa-1x"/>
          </span>
        </h3>
        <div v-if="display">
          <div
            v-for="prop of properties"
            :key="prop.key">
            <p v-if="recording.batteryLevel && prop.key === 'batteryLevel'">
              <strong>Battery Level: </strong><BatteryLevel :battery-level="recording.batteryLevel"/>
            </p>
            <p v-else-if="recording.location && prop.key === 'location'">
              <strong>Location: </strong>{{ parseLocation }}
            </p>
            <div v-else-if="recording.additionalMetadata && prop.key === 'additionalMetadata'">
              <div
                v-for="(value, key) of recording.additionalMetadata"
                :key="key">
                <p v-if="key != 'tracks' && key != 'user-entered'">
                  <strong>{{ key }}:</strong> {{ value }}
                </p>
              </div>
            </div>
            <p v-else-if="recording[prop.key] != null" >
              <strong>{{ prop.title }}:</strong> {{ recording[prop.key] }}
            </p>
          </div>
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
          @click="deleteRecording()">Delete Recording</b-button>
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
import BatteryLevel from '../BatteryLevel.vue';

export default {
  name: 'RecordingProperties',
  components: {
    BatteryLevel,
  },
  props: {
    value: {
      type: String,
      default: "",
    },
    downloadRawUrl: {
      type: String,
      default: "",
    },
    downloadFileUrl: {
      type: String,
      default: "",
    },
    recording: {
      type: Object,
      required: true,
    },
    tracks: {
      type: Array,
      required: true,
    }
  },
  data () {
    return {
      display: false,
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
      ],
      metaFields: [
        {
          key: 'key',
          label: 'Additional Metadata'
        },
        {
          key: 'data',
          label: ''
        }
      ]
    };
  },
  computed: {
    parseLocation: function () {
      if (this.recording.location.type === 'Point') {
        return `Lat: ${this.recording.location.coordinates[0].toFixed(2)}, Long: ${this.recording.location.coordinates[1].toFixed(2)}`;
      } else {
        return this.recording.location;
      }
    },
    metaItems: function () {
      const data = this.recording['additionalMetadata'];
      const items = [];
      for (const key in data) {
        if (key != "tracks") {
          items.push({
            key: key,
            data: data[key]
          });
        }
      }
      return items;
    }
  },
  methods: {
    async updateComment() {
      const {success} = await api.recording.comment(this.value, this.$route.params.id);
      if(success) {
        this.showCommentAlert = true;
      }
    },
    async deleteRecording() {
      const {success} = await api.recording.del(this.$route.params.id);
      if(success) {
        this.showDeleteAlert = true;
        this.$emit('nextOrPreviousRecording');
      }
    }
  }
};
</script>

<style scoped>
</style>
