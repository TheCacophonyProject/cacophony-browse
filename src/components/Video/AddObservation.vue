<template>
  <div>
    <h3>Add animal observation</h3>
    <b-form>

      <b-form-group
        label="Animal:"
        horizontal>
        <b-form-select
          v-model="animalTag"
          :options="animalOptions" />
      </b-form-group>

      <b-form-group
        label="Number:"
        horizontal>
        <b-input
          v-model="number"
          type="number" />
      </b-form-group>

      <b-form-group
        label="Event:"
        horizontal>
        <b-form-select
          v-model="event"
          :options="eventOptions" />
      </b-form-group>

      <b-form-group
        label="Confidence:"
        horizontal>
        <b-form-radio-group
          v-model="confidence"
          :options="confidenceOptions" />
      </b-form-group>

      <b-form-group
        label="Age:"
        horizontal>
        <b-input
          v-model="age"
          :state="ageState"
          placeholder="Years:Months"/>
      </b-form-group>

      <b-form-group
        label="Trap type:"
        horizontal>
        <b-form-select
          v-model="trap"
          :options="trapOptions" />
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
          <b-button
            class="col-md-3 m-1"
            @click="setCurrentVideoTime('start')">go to start time</b-button>
          <b-button
            class="col-md-3 m-1"
            @click="setTimeAsCurrentTime('startTime')">set to current time</b-button>
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
          <b-button
            class="col-md-3 m-1"
            @click="setCurrentVideoTime('end')">go to end time</b-button>
          <b-button
            class="col-md-3 m-1"
            @click="setTimeAsCurrentTime('endTime')">set to current time</b-button>
        </b-form-row>
      </b-form-group>

      <b-button
        :block="true"
        variant="primary"
        @click="addManualTag()">Add new tag</b-button>
      <b-alert
        :show="showAlert"
        variant="warning"
        dismissible
        class="mt-2"
        @dismissed="showAlert=false">{{ alertMessage }}</b-alert>
    </b-form>
  </div>
</template>

<script>

export default {
  name: 'AddObservation',
  props: {
    currentVideoTime: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      animalTag: null,
      animalOptions: [
        {value: null, text: 'Choose an animal'}, "bird", "bird/kiwi", "rat", "possum", "hedgehog", "stoat", "ferret", "weasel", "mouse", "cat", "dog", "rabbit", "hare", "human", "spider", "insect", "other", "unidentified"
      ],
      number: 1,
      event: "just wandering about",
      eventOptions: [
        "just wandering about", "false positive", "multiple animals", "interaction with lure", "interaction with trap", "set trap to activate", "trapped in trap", "other"
      ],
      confidence: 0.8,
      confidenceOptions: [
        {value: 0.4, text: "low"},
        {value: 0.6, text: "mid"},
        {value: 0.8, text: "high"}
      ],
      age: null,
      trap: null,
      trapOptions: [
        {value: null, text: 'Choose a trap'},
        "Good Nature possums", "Good nature rat", "Short live capture", "Long live capture", "Timms", "Doc 200", "Trapinator", "Rat poison station", "other"
      ],
      startTime: null,
      endTime: null,
      showAlert: false,
      alertMessage: ""
    };
  },
  computed: {
    ageState () {
      const pattern = /(\d)?(\d):(\d)?(\d)/;
      if (this.age) {
        return pattern.test(this.age);
      } else {
        return null;
      }
    },
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
    ageMonths () {
      if (this.age) {
        const ageString = this.age;
        const ageYears = parseInt(ageString.split(':')[0]);
        const ageMonths = parseInt(ageString.split(':')[1]);
        return ageYears * 12 + ageMonths;
      } else {
        return null;
      }
    },
  },
  methods: {
    addManualTag() {
      if (this.ageState === false || this.startTimeState === false || this.endTimeState === false) {
        this.showAlert = true;
        this.alertMessage = "Invalid form.";
        return;
      } else {
        const tag = {};
        try {
          tag.animal = this.animalTag;
          tag.number = this.number;
          tag.event = this.event;
          tag.confidence = this.confidence;
          tag.age = this.ageMonths;
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
