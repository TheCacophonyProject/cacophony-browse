<template>
  <b-row>
    <b-col
      cols="12"
      lg="8">
      <audio
        ref="player"
        :src="audioUrl"
        controls
        autoplay
        class="audio"/>
      <PrevNext
        :recording="recording"
        @nextRecording="gotoNextRecording($event.direction, $event.tagMode, $event.tags)"/>

      <b-col 
        offset="2"
        class="mt-2">   
        <BasicTags />              
      </b-col>

      <b-col 
        offset="2"
        class="mt-2">   
        <CustomTags />
      </b-col>

    </b-col>


    <b-col
      cols="12"
      lg="4">
      <h2>Recording</h2>
      <RecordingProperties
        v-model="recording.comment"
        :download-raw-url="audioRawUrl"
        :download-file-url="audioUrl"
        :recording="recording"
        @nextOrPreviousRecording="gotoNextRecording('either', 'any')"/>
      <VideoHelp class="mt-2" />
    </b-col>
    

  </b-row>
</template>

<script>
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
};
</script>

<style scoped>
  .tag-buttons, .img-buttons {
    padding: 0 5px;
  }
</style>

