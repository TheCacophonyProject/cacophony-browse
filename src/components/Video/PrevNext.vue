<template>
  <div>
    <img
    class="img-button"
    title="Previous for device, skipping bird &amp; false-positives"
    src="../../assets/video/previous-interesting.png"
    onclick="nextRecording('previous', 'any', ['interesting'])"/>
    <img
    class="img-button"
    title="Previous for device, not manually tagged"
    src="../../assets/video/previous-no-human.png"
    onclick="nextRecording('previous', 'no-human')"/>
    <img
    class="img-button"
    title="Previous for device"
    src="../../assets/video/previous.png"
    onclick="nextRecording('previous', 'any')"/>
    <img
    class="img-button"
    title="Next for device"
    src="../../assets/video/next.png"
    onclick="nextRecording('next', 'any')" />
    <img
    class="img-button"
    title="Next for device, not manually tagged"
    src="../../assets/video/next-no-human.png"
    onclick="nextRecording('next', 'no-human')" />
    <img
    class="img-button"
    title="Next for device, skipping birds &amp; false-positives"
    src="../../assets/video/next-interesting.png"
    onclick="nextRecording('next', 'any', ['interesting'])" />
  </div>
</template>

<script>

export default {
	// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
	name: 'prev-next',
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
  max-width: 15%;
  max-height: 75px;
  width: auto;
  height: auto;
}

</style>
