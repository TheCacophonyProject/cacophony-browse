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
          :options="eventOptions" />
      </b-form-group>

      <b-form-group
        label="Animal:"
        horizontal>
        <b-form-select
          v-model="animalTag"
          :options="animalOptions" />
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

export default {
  name: 'AddObservation',
  data () {
    return {
      animalTag: null,
      animalOptions: [
        {value: null, text: 'none'},
        "possum",
        "hedgehog",
        {value: "rat", text: 'rat or mouse'},
        {value: "stoat", text: 'stoat, weasel or ferret (mustelid)'},
        "bird",
        "bird/kiwi",
        "cat",
        "dog",
        "rabbit",
        "human",
        {value: "insect", text: 'spider or insect (on camera lens or flying)'},
        {value: "pest", text: 'unidentified animal but not bird'},
      ],
      event: null,
      eventOptions: [
        {value: null, text: 'Please select tag type...'},
        {value: "missed track", text: 'Missed animal track'},
        {value: "multiple animals", text: 'Multiple animals in video'},
        {value: "trapped in trap", text: 'Animal in trap'},
        {value: "animal", text: 'Untracked animal (please specify animal)'},
        "other"
      ],
      confidence: 0.8,
      confidenceOptions: [
        {value: 0.4, text: "low"},
        {value: 0.6, text: "mid"},
        {value: 0.8, text: "high"}
      ],
      startTime: null,
      endTime: null,
      showAlert: false,
      alertMessage: ""
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
