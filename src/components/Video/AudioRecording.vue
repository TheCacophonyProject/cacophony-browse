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

