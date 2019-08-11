<template>
  <b-container>
    <b-row>
      <b-col
        cols="12"
        lg="8"
        class="mb-2">
        <audio
          ref="player"
          :src="audioUrl"
          volume="0.75"
          controls
          autoplay
          class="audio"/>
      </b-col>
    </b-row>
    <b-row>
      <b-col 
        cols="2" 
        class="db">
        <b-button-group 
          class="pl-4"
          vertical>
          <b-button 
            class="mt-1" 
            @click="volumeLoudest">Loudest</b-button>
          <b-button 
            class="mt-1" 
            @click="volumeLouder">Louder</b-button>
          <b-button class="mt-1">Default</b-button>
          <b-button 
            class="mt-1" 
            @click="volumeQuieter">Quieter</b-button>
          <b-button 
            class="mt-1" 
            @click="volumeQuietest">Quietest</b-button>
        </b-button-group>
      </b-col>
      <b-row 
        class="db m-0 no-gutters">
        <b-col 
          offset="1"
          class="mt-0 ml-0 db"
          cols="19">   
          <BasicTags @addAudioTag="addAudioTag($event)"/>              
          <CustomTags @addAudioTag="addAudioTag($event)"/>
          <b-button 
            class="float-right mt-3 mr-1"
            size="lg"             
            @click="closeTab()">Done</b-button>                              
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
import {mapState} from 'vuex';
import PrevNext from './PrevNext.vue';
import RecordingProperties from './RecordingProperties.vue';
import BasicTags from '../Audio/BasicTags.vue';
import CustomTags from '../Audio/CustomTags.vue';
import TagList from '../Audio/TagList.vue';
//import config from '../../config.js';

export default {
  name: 'AudioRecording',
  components: {CustomTags, BasicTags, PrevNext, RecordingProperties, TagList},
  props: {
    recording: {
      type: Object,
      required: true,
    },
    audioUrl: {
      type: String,
      required: true,
    },
    audioRawUrl: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState({
      tagItems() {
        const result = this.$store.getters['Video/getTagItems'];
        return result;
      },
    }),
  },
  methods:{
    addAudioTag: function(tag){
      const id = Number(this.$route.params.id);
      if (this.$refs.player.currentTime == this.$refs.player.duration){
        tag.startTime = 0;
      } else {
        tag.startTime = this.$refs.player.currentTime.toFixed(2);
      }
      
      // eslint-disable-next-line no-console
      // console.log(config.tagVersion);
      // next line generates internal server error on test api - menno to follow up
      // tag.version = config.tagVersion;

      this.$store.dispatch('Video/ADD_TAG', { tag, id });
      
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
      this.$store.dispatch('Video/DELETE_TAG', tagId);
    },
    closeTab(){
      window.close();
    },
    replay(time){            
      this.$refs.player.currentTime = time;
      this.$refs.player.play();
    },
    volumeLoudest(){
      this.$refs.player.volume = 1.0;
    },
    volumeLouder(){      
      if ((this.$refs.player.volume + 0.1) <= 1.0) {
        this.$refs.player.volume += 0.1;
      }
    },
    volumeDefault(){      
      this.$refs.player.volume = 0.75;
    },
    volumeQuieter(){
      if ((this.$refs.player.volume - 0.1) >= 0) {
        this.$refs.player.volume -= 0.1;
      }
    },
    volumeQuietest(){
      this.$refs.player.volume = 0.25;
    }
  }
};
</script>

<style scoped>
  .tag-buttons, .img-buttons {
    padding: 0 5px;
  }
  .db{
    border: 0px;
  }
</style>
