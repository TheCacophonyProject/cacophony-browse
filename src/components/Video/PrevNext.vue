<template>
  <div>
    <img
      class="img-button"
      title="Previous for device, skipping bird &amp; false-positives"
      src="../../assets/video/previous-interesting.png"
      @click="nextRecording('previous', 'any', ['interesting'])">
    <img
      class="img-button"
      title="Previous for device, not manually tagged"
      src="../../assets/video/previous-no-human.png"
      @click="nextRecording('previous', 'no-human')">
    <img
      class="img-button"
      title="Previous for device"
      src="../../assets/video/previous.png"
      @click="nextRecording('previous', 'any')">
    <img
      class="img-button"
      title="Next for device"
      src="../../assets/video/next.png"
      @click="nextRecording('next', 'any')" >
    <img
      class="img-button"
      title="Next for device, not manually tagged"
      src="../../assets/video/next-no-human.png"
      @click="nextRecording('next', 'no-human')" >
    <img
      class="img-button"
      title="Next for device, skipping birds &amp; false-positives"
      src="../../assets/video/next-interesting.png"
      @click="nextRecording('next', 'any', ['interesting'])" >
    <b-alert
      :show="showAlert"
      variant="warning"
      dismissible
      @dismissed="showAlert=false">No {{ direction }} recording for this device.</b-alert>
  </div>
</template>

<script>

import api from '../../api/index';

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'PrevNext',
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {
    recording: {
      type: Object,
      default: function () {
        return {};
      }
    }
  },
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data () {
    return {
      direction: "",
      showAlert: false
    };
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {

  },
  methods: {
    nextRecording(direction, tagMode, tags) {
      var query = {
        DeviceId: this.recording.Device.id,
      };
      let order;
      switch (direction) {
      case "next":
        query.recordingDateTime = {gt: this.recording.recordingDateTime};
        order = "ASC";
        break;
      case "previous":
        query.recordingDateTime = {lt: this.recording.recordingDateTime};
        order = "DESC";
        break;
      default:
        throw `invalid direction: '${direction}'`;
      }

      if (!tags) {
        tags = null;
      }


      let token = this.$store.state.User.JWT;
      let limit = 1;
      let offset = 0;
      let orderJSON = JSON.stringify([["recordingDateTime", order]]);

      return new Promise((resolve, reject) => {
        api.recording.query(token, limit, offset, tagMode, tags, query, orderJSON)
          .then(response => response.json())
          .then((json) => {
            if(!json.success) {
              reject(json);
            } else {
              if (json.rows.length == 0) {
                this.showAlert = true;
                this.direction = direction;
                return;
              }
              this.$router.push({path: `/video/${json.rows[0].id}`});
              resolve(json);
            }
          });
      });
    }
  }
};

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
