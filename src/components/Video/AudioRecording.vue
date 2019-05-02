<template>
  <b-row>
    <b-col
      cols="12"
      lg="8">
      <audio
        ref="player"
        :src="audioUrl"
        volume="0.75"
        controls
        autoplay
        class="audio"/>
      <PrevNext
        :recording="recording"
        @nextRecording="gotoNextRecording($event.direction, $event.tagMode, $event.tags)"/>


      <b-col 
        cols="1" 
        class="mt-3">
        <b-button-group 
          class="ml-4"
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

      <b-col 
        offset="3"
        class="mt-2">   
        <BasicTags />              
      </b-col>

      <b-col 
        offset="3"
        class="mt-2">   
        <CustomTags />
      </b-col>

    </b-col>


    <b-col
      cols="12"
      lg="4">
      <h2>Recording</h2>
      <!--
      <RecordingProperties
        v-model="recording.comment"
        :download-raw-url="audioRawUrl"
        :download-file-url="audioUrl"
        :recording="recording"
        @nextOrPreviousRecording="gotoNextRecording('either', 'any')"/>
      <VideoHelp class="mt-2" />
      -->
    </b-col>
    

  </b-row>
</template>

<script>
/* eslint-disable no-console */
import PrevNext from './PrevNext.vue';
import RecordingProperties from './RecordingProperties.vue';
import VideoHelp from './VideoHelp.vue';
import BasicTags from '../Audio/BasicTags.vue';
import CustomTags from '../Audio/CustomTags.vue';

export default {
  name: 'AudioRecording',
  components: {CustomTags, BasicTags, PrevNext, RecordingProperties, VideoHelp},
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
  methods:{
    addAudioTag: function(tag){
      console.log("addAudioTag Method Called");
      console.log(tag);
      // https://api-test.cacophony.org.nz/api/v1/tags
      // tag format
      // recordingId - integer, COMPULSORY
      // tagId integer OPTIONAL on get or post operation, COMPULSORY for delete, if tag id given for get or post then
      // the operation is an update, provided the authenticated user is the same as the tagger id
      // tag: string - known values - "unknown", "nothing of interest", "bird", "human", custom tag free text COMPULSORY maxlength 64
      // startTime - integer (0 - 60) seconds since start of audio clip COMPULSORY
      // duration - integer (0 - 60) seconds duration of tag, OPTIONAL
      // confidence - real 0.0 - 1.0 OPTIONAL default is 0.5 
      // taggerId (authenticated user id) COMPULSORY authenticated by backend
      // automatic -Boolean	"true" if tag is machine generated, "false" if human COMPULSORY
      // schemaVersion - integer 0000 MMnn MAJORminor - Future proofing for schema changes Starts with 0100 (v1.00) COMPULSORY
    },
    volumeLoudest(){
      console.log(this.$refs);
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
</style>

