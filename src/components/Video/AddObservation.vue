<template>
  <div>
    <h3>Add animal observation</h3>
    <b-form>

          <b-form-group label="Animal:" horizontal>
            <b-form-select v-model="animalTag" v-bind:options="animalOptions" />
          </b-form-group>

          <b-form-group label="Number:" horizontal>
            <b-input v-model="number" type="number" />
          </b-form-group>

          <b-form-group label="Event:" horizontal>
            <b-form-select v-model="event" v-bind:options="eventOptions" />
          </b-form-group>

          <b-form-group label="Confidence:" horizontal>
            <b-form-radio-group v-model="confidence" v-bind:options="confidenceOptions" />
          </b-form-group>

          <b-form-group label="Age:" horizontal>
            <b-input v-model="age" placeholder="Years:Months" v-bind:state="ageState"/>
          </b-form-group>

          <b-form-group label="Trap type:" horizontal>
            <b-form-select v-model="trap" v-bind:options="trapOptions" />
          </b-form-group>

          <b-form-group label="Start time:" horizontal>
            <b-form-row>
              <b-input class="col m-1" v-model="startTime" v-bind:state="startTimeState" placeholder="min:sec" />
              <b-button class="col-md-3 m-1" onclick="goToStartTime(this)">go to start time</b-button>
              <b-button class="col-md-3 m-1" onclick="setStartTimeAsCurrentTime()">set to current time</b-button>
            </b-form-row>
          </b-form-group>

          <b-form-group label="End time:" horizontal>
            <b-form-row>
              <b-input class="col m-1" v-model="endTime" v-bind:state="endTimeState" placeholder="min:sec" />
              <b-button class="col-md-3 m-1" onclick="goToStartTime(this)">go to end time</b-button>
              <b-button class="col-md-3 m-1" onclick="setStartTimeAsCurrentTime()">set to current time</b-button>
            </b-form-row>
          </b-form-group>

      <b-button v-bind:block="true" variant="primary" onclick="tags.new()">Add new tag</b-button>
    </b-form>
  </div>
</template>

<script>

export default {
	// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
	name: 'add-observation',
	// https://vuejs.org/v2/style-guide/#Component-data-essential
	data () {
		return {
      animalTag: null,
      animalOptions: [
        {value: null, text: 'Choose an animal'}, "bird", "bird/kiwi", "rat", "possum", "hedgehog", "stoat", "ferret", "weasel", "mouse", "cat", "dog", "rabbit", "hare", "human", "spider", "insect", "other", "unidentified"
      ],
      number: 1,
      event: "just wandering about",
      eventOptions: [
        "just wandering about", "false positive", "interaction with lure", "interaction with trap", "set trap to activate", "trapped in trap", "other"
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
      endTime: null
		}
	},
	// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
	computed: {
    ageState () {
      let pattern = /(\d)?(\d):(\d)?(\d)/
      if (this.age) {
        return pattern.test(this.age)
      } else {
        return null
      }
    },
    startTimeState () {
      let pattern = /(\d)?(\d):[0-5][0-9]/
      if (this.startTime) {
        return pattern.test(this.startTime)
      } else {
        return null
      }
    },
    endTimeState () {
      let pattern = /(\d)?(\d):[0-5][0-9]/
      if (this.endTime) {
        return pattern.test(this.endTime)
      } else {
        return null
      }
    }
	},
	// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
	props: {}
}
</script>

<style scoped>

</style>
