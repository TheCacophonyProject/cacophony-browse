<template>
  <b-container>
    <b-row>
      <b-col cols="12" lg="8" class="mb-2">
        <audio
          ref="player"
          :src="audioUrl"
          volume="0.75"
          controls
          autoplay
          class="audio"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="2" class="db">
        <b-button-group class="pl-4" vertical>
          <b-button class="mt-1" @click="volumeLoudest">Loudest</b-button>
          <b-button class="mt-1" @click="volumeLouder">Louder</b-button>
          <b-button class="mt-1">Default</b-button>
          <b-button class="mt-1" @click="volumeQuieter">Quieter</b-button>
          <b-button class="mt-1" @click="volumeQuietest">Quietest</b-button>
        </b-button-group>
      </b-col>
      <b-row class="db m-0 no-gutters">
        <b-col offset="1" class="mt-0 ml-0 db" cols="12">
          <BasicTags @addAudioTag="addAudioTag($event)" />
          <CustomTags @addAudioTag="addAudioTag($event)" />
          <b-button class="float-right mt-3 mr-1" size="lg" @click="done()"
            >Done</b-button
          >
        </b-col>
        <b-col offset="9" md="3" class=" mt-3">
          <b-button
            v-b-tooltip.hover.bottomleft="'Delete this recording'"
            :disabled="deleteDisabled"
            variant="danger"
            block
            @click="deleteRecording()"
          >
            <font-awesome-icon
              icon="exclamation-triangle"
              class="d-none d-md-inline"
            />
            Delete
          </b-button>
        </b-col>
      </b-row>
    </b-row>
    <b-row>
      <TagList
        :items="tagItems"
        @deleteTag="deleteTag($event)"
        @replay="replay($event)"
      />
    </b-row>
  </b-container>
</template>

<script>
import api from "../../api/index";
import { mapState } from "vuex";
import BasicTags from "../Audio/BasicTags.vue";
import CustomTags from "../Audio/CustomTags.vue";
import TagList from "../Audio/TagList.vue";

export default {
  name: "AudioRecording",
  data() {
    return { deleteDisabled: false };
  },
  components: {
    CustomTags,
    BasicTags,
    TagList
  },
  props: {
    recording: {
      type: Object,
      required: true
    },
    audioUrl: {
      type: String,
      required: true
    },
    audioRawUrl: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState({
      tagItems() {
        const result = this.$store.getters["Video/getTagItems"];
        return result;
      }
    })
  },
  methods: {
    async gotoNextRecording(direction) {
      if (await this.getNextRecording(direction)) {
        this.deleteDisabled = false;
        this.$router.push({
          path: `/recording/${this.recording.id}`
        });
      }
    },
    async getNextRecording(direction, skipMessage) {
      let where = {
        DeviceId: this.recording.Device.id
      };

      let order;
      switch (direction) {
        case "next":
          where.recordingDateTime = {
            $gt: this.recording.recordingDateTime
          };
          order = "ASC";
          break;
        case "previous":
          where.recordingDateTime = {
            $lt: this.recording.recordingDateTime
          };
          order = "DESC";
          break;
        case "either":
          if (await this.getNextRecording("next", true)) {
            return true;
          }
          return await this.getNextRecording("previous", skipMessage);
        default:
          throw `invalid direction: '${direction}'`;
      }
      order = JSON.stringify([["recordingDateTime", order]]);
      where = JSON.stringify(where);

      const params = {
        where,
        order,
        limit: 1,
        offset: 0
      };

      return await this.$store.dispatch("Video/QUERY_RECORDING", {
        params,
        direction,
        skipMessage
      });
    },
    async deleteRecording() {
      this.deleteDisabled = true;
      const { success } = await api.recording.del(this.$route.params.id);
      if (success) {
        this.gotoNextRecording("either");
      }
    },
    addAudioTag: function(tag) {
      const id = Number(this.$route.params.id);
      if (this.$refs.player.currentTime == this.$refs.player.duration) {
        tag.startTime = 0;
      } else {
        tag.startTime = this.$refs.player.currentTime.toFixed(2);
      }

      // eslint-disable-next-line no-console
      // console.log(config.tagVersion);
      // next line generates internal server error on test api - menno to follow up
      // tag.version = config.tagVersion;

      this.$store.dispatch("Video/ADD_TAG", { tag, id });

      // https://api-test.cacophony.org.nz/api/v1/tags
      // tag format
      // tagId integer OPTIONAL on get or post operation, COMPULSORY for delete, if tag id given for get or post then operation is an UPDATE
      // recordingId - integer, COMPULSORY
      // the operation is an update, provided the authenticated user is the same as the tagger id
      // tag: string - known values - "unknown", "nothing of interest", "bird", "human", custom tag free text COMPULSORY maxlength 64
      // startTime - integer (0 - 60) seconds since start of audio clip COMPULSORY
      // duration - integer (0 - 60) seconds duration of tag, OPTIONAL
      // confidence - real 0.0 - 1.0 OPTIONAL default is 0.5
      // taggerId (authenticated user id) COMPULSORY authenticated by backend
      // automatic -Boolean	"true" if tag is machine generated, "false" if human COMPULSORY
      // schemaVersion - integer 0000 MMnn MAJORminor - Future proofing for schema changes Starts with 0100 (v1.00) COMPULSORY
    },
    deleteTag(tagId) {
      this.$store.dispatch("Video/DELETE_TAG", tagId);
    },
    done() {
      this.gotoNextRecording("either");
    },
    replay(time) {
      this.$refs.player.currentTime = time;
      this.$refs.player.play();
    },
    volumeLoudest() {
      this.$refs.player.volume = 1.0;
    },
    volumeLouder() {
      if (this.$refs.player.volume + 0.1 <= 1.0) {
        this.$refs.player.volume += 0.1;
      }
    },
    volumeDefault() {
      this.$refs.player.volume = 0.75;
    },
    volumeQuieter() {
      if (this.$refs.player.volume - 0.1 >= 0) {
        this.$refs.player.volume -= 0.1;
      }
    },
    volumeQuietest() {
      this.$refs.player.volume = 0.25;
    }
  }
};
</script>

<style scoped>
.tag-buttons,
.img-buttons {
  padding: 0 5px;
}
.db {
  border: 0px;
}
</style>
