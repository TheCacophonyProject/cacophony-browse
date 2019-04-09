<template>
  <b-container>
    <b-row>
      <b-col cols="12">
        <h4>'{{ devicename }}' - {{ date }}, {{ time }}</h4>
      </b-col>
      <b-col
        cols="12"
        lg="8">      
        <audio
          id="player"
          ref="player"
          :src="fileSource"
          controls
          autoplay
          class="audio_control"/>            
      </b-col>  
    </b-row>
    <b-row> 
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
        lg="5" 
        offset="1"
        class="mt-3">   
        <b-button-group>
          <b-button class="basicTags">Unknown</b-button>
          <b-button class="basicTags">Nothing of interest</b-button>
          <b-button class="basicTags">Bird</b-button>
          <b-button class="basicTags">Human</b-button>
        </b-button-group>          
      </b-col>
    </b-row>    
    <b-row class="mt-4">
      <b-col 
        cols="5" 
        offset="2">
        <label>Custom Tags</label>
        <b-input-group>
          <b-form-input v-model="customTag"/>
          <b-button>Apply</b-button>
        </b-input-group>
      </b-col>
    </b-row>
    <b-row>
      <audioTags/>
    </b-row>
    
  </b-container>
</template>

<script>

import config from '../config';
import {mapState} from 'vuex';
import AudioTags from '../components/AudioTagging/AudioTags.vue';

export default {
  name: 'AudioTaggingView',
  components: {
    AudioTags
  },
  data:function() {
    return {
      customTag: ''
    };
  },
  computed:
    mapState({
      recording: state => state.Video.recording,
      downloadFileJWT: state => state.Video.downloadFileJWT,
      downloadRawJWT: state => state.Video.downloadRawJWT,
      isAudio: state => state.Video.recording.type == "audio",
      date: (state) => {
        const date = new Date(state.Video.recording.recordingDateTime);
        return date.toLocaleDateString('en-NZ');
      },
      time: state => {
        const date = new Date(state.Video.recording.recordingDateTime);
        return date.toLocaleTimeString();
      },
      devicename: state => {
        if (state.Video.recording.Device) {
          return state.Video.recording.Device.devicename;
        }
        return "";
      },
      fileSource: state => `${config.api}/api/v1/signedUrl?jwt=${state.Video.downloadFileJWT}`,
      rawSource: state => `${config.api}/api/v1/signedUrl?jwt=${state.Video.downloadRawJWT}`,
    }),
  watch: {
    '$route' () {
      this.getRecordingDetails();
    }
  },
  created: async function () {
    await this.getRecordingDetails();
  },
  methods: {
    getRecordingDetails() {
      // recording id will be passed as parameter - hard coded for now ...
      // this.$store.dispatch('Video/GET_RECORDING', '52451');
      // this.$store.dispatch('Video/GET_RECORDING', '0069_20190406a');
      this.$store.dispatch('Video/GET_RECORDING', 'HLHaW0A4vuAB4VBrd7vT');        
    },
    volumeLoudest(){
      const audio = document.getElementById("player");
      audio.volume = 1.0;
    },
    volumeLouder(){
      const audio = document.getElementById("player");
      if ((audio.volume + 0.1) <= 1.0) {
        audio.volume += 0.1;
      }
    },
    volumeDefault(){
      const audio = document.getElementById("player");
      audio.volume = 1.0;
    },
    volumeQuieter(){
      const audio = document.getElementById("player");
      if ((audio.volume - 0.1) >= 0) {
        audio.volume -= 0.1;
      }
    },
    volumeQuietest(){
      const audio = document.getElementById("player");
      audio.volume = 0.25;
    }
  }
};
</script>

<style scoped>
  .audio_control{
    min-width: 100%;
    max-width: 100%;
  }

  .basicTags {
    margin: 5px;
  }

  </style>