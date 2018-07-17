<template>
  <div>
    <h3>Help</h3>
    <b-row>
      <b-col cols="4">
        <img class="img-button" src="../../assets/video/previous.png" />
        <img class="img-button" src="../../assets/video/next.png" />
      </b-col>
      <b-col cols="8">
        <p class="col-xs-6">Move between recordings for device</p>
      </b-col>

      <b-col cols="4">
        <img class="img-button" src="../../assets/video/previous-no-human.png" />
        <img class="img-button" src="../../assets/video/next-no-human.png" />
      </b-col>
      <b-col cols="8">
        <p class="col-xs-6">Move between recordings for device which have not been manually tagged</p>
      </b-col>

      <b-col cols="4">
        <img class="img-button" src="../../assets/video/previous-interesting.png" />
        <img class="img-button" src="../../assets/video/next-interesting.png" />
      </b-col>
      <b-col cols="8">
        <p class="col-xs-6">Move between 'interesting' tagged recordings for device where the first tag is not a a bird or false/positive</p>
      </b-col>
    </b-row>
  </div>
</template>

<script>

export default {
	// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
	name: 'video-help',
	// https://vuejs.org/v2/style-guide/#Component-data-essential
	data () {
		return {

		}
	},
	// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
	computed: {

	},
	// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
	props: {}
}
</script>

<style scoped>
.img-button {
  cursor: pointer;
  box-sizing: border-box;
  max-width: 40%;
  max-height: 75px;
  width: auto;
  height: auto;
}
</style>
