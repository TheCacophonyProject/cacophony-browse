<template>
  <div>
    <h3>Video properties</h3>
    <b-form>
      <b-form-group label="Processing:" horizontal>
        <b-input value="Finished" disabled />
      </b-form-group>

      <b-form-group label="Comment" horizontal>
        <b-form-row class="m-0">
          <b-form-textarea class="col">
            Comment
          </b-form-textarea>
          <div class="col-md-1" />
          <b-button class="col-md-3">Save Comment</b-button>
        </b-form-row>
      </b-form-group>

      <b-form-group>
        <b-button block variant="danger">Delete Video</b-button>
      </b-form-group>

    </b-form>

    <h3>Download Files</h3>
    <b-button>Download Raw</b-button>
    <b-button>Download File</b-button>

  </div>
</template>

<script>

export default {
	// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
	name: 'video-properties',
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

</style>
