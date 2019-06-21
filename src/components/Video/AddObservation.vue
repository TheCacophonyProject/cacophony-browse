<template>
  <div>
    <b-modal
      id="video-tag"
      title="Add tag to video"
      @ok="addManualTag()">

      <b-form-group
        label="Event:"
        horizontal>
        <b-form-select
          v-model="event"
          :options="eventOptions">
          <template slot="first">
            <option 
              :value="null" 
              disabled>Please select tag type...
            </option>
          </template>
        </b-form-select>
      </b-form-group>

      <b-form-group
        label="Animal:"
        horizontal>
        <b-form-select
          v-model="animalTag"
          :options="animalOptions"
          :disabled="animalDisabled"/>
      </b-form-group>

      <b-form-group
        label="Confidence:"
        horizontal>
        <b-form-radio-group
          v-model="confidence"
          :options="confidenceOptions" />
      </b-form-group>

      <b-form-group
        label="Start time:"
        horizontal>
        <b-form-row>
          <b-input
            v-model="startTime"
            :state="startTimeState"
            class="col m-1"
            placeholder="min:sec" />
        </b-form-row>
      </b-form-group>

      <b-form-group
        label="End time:"
        horizontal>
        <b-form-row>
          <b-input
            v-model="endTime"
            :state="endTimeState"
            class="col m-1"
            placeholder="min:sec" />
        </b-form-row>
      </b-form-group>

      <b-alert
        :show="showAlert"
        variant="warning"
        dismissible
        class="mt-2"
        @dismissed="showAlert=false">{{ alertMessage }}</b-alert>
    </b-modal>
  </div>
</template>

<script>
import DefaultLabels from '../../const.js';

export default {
  name: 'AddObservation',
  data () {
    return {
      animalTag: null,
      animalOptions: DefaultLabels.animals,
      event: null,
      eventOptions: DefaultLabels.recordingLabels,
      confidence: 0.8,
      confidenceOptions: [
        {value: 0.4, text: "low"},
        {value: 0.6, text: "mid"},
        {value: 0.8, text: "high"}
      ],
      startTime: null,
      endTime: null,
      showAlert: false,
      alertMessage: "",
      animalDisabled: true,
    };
  },
  computed: {
    startTimeState () {
      const pattern = /(\d)?(\d):[0-5][0-9]/;
      if (this.startTime) {
        return pattern.test(this.startTime);
      } else {
        return null;
      }
    },
    endTimeState () {
      const pattern = /(\d)?(\d):[0-5][0-9]/;
      if (this.endTime) {
        return pattern.test(this.endTime);
      } else {
        return null;
      }
    },
    duration () {
      if (this.endTime == null || this.startTime == null) {
        return null;
      }

      const endTime = this.parseTimeString(this.endTime);
      const startTime = this.parseTimeString(this.startTime);
      const duration = endTime - startTime;

      if (duration <= 0) {
        throw { message: "Negative duration. (Start time is after end time!)" };
      }
      return duration;
    },
  },
  watch: {
    event: function (value) {
      const disableAnimal = (value !== 'animal');
      if (disableAnimal) {
        this.animalTag = null;
      }
      this.animalDisabled = disableAnimal;
    },
  },
  methods: {
    addManualTag() {
      if (this.event == null) {
        this.showAlert = true;
        this.alertMessage = "Please select a tag type.";
        return;
      } else if (this.startTimeState === false || this.endTimeState === false) {
        this.showAlert = true;
        this.alertMessage = "Invalid form.";
        return;
      } else {
        const tag = {};
        try {
          tag.animal = null;
          tag.event = this.event;
          if (tag.event == 'animal') {
            tag.event = 'just wandering about';
            tag.animal = this.animalTag;
          }

          tag.confidence = this.confidence;
          if (this.startTime) {
            tag.startTime = this.parseTimeString(this.startTime);
          }
          tag.duration = this.duration;
          tag.trapType = this.trap;

          // save user tag defaults.
          // user.setTagDefault('tagAnimalInput', tag.animal);
          // user.setTagDefault('tagEventInput', tag.event);
          // user.setTagDefault('tagTrapTypeInput', tag.trapType);
        } catch (err) {
          this.showAlert = true;
          this.alertMessage = err.message;
          return;
        }
        this.$emit('addTag', tag);
        this.$emit('hideAddObservations');
      }
    },
    parseTimeString (timeString) {
      const timeArray = timeString.split(':');
      const minutes = parseInt(timeArray[0]);
      const seconds = parseInt(timeArray[1]);
      return minutes * 60 + seconds;
    },
    setTimeAsCurrentTime(type) {
      this.$emit('get-current-video-time');
      this.$nextTick(function () {
        const currentTime = this.currentVideoTime;
        let timeString = "";
        if (currentTime > 60) {
          const minutes = Math.trunc(currentTime / 60);
          const seconds = Math.trunc(currentTime % 60);
          timeString = `${minutes}:${("0" + seconds).slice(-2)}`;
        } else {
          const seconds = Math.trunc(currentTime);
          timeString = `0:${("0" + seconds).slice(-2)}`;
        }
        this[type] = timeString;
      });
    },
    setCurrentVideoTime(type) {
      let timeString;
      if (type === 'start' && this.startTime) {
        timeString = this.startTime;
      } else if (type === 'end' && this.endTime) {
        timeString = this.endTime;
      } else {
        throw `Error with ${type} time.`;
      }
      const time = this.parseTimeString(timeString);
      this.$emit('set-current-video-time', time);
    }
  }
};
</script>

<style scoped>

</style>
