<template>
  <div class="img-buttons">
    <span
      title="Previous for device, skipping bird &amp; false-positives"
      @click="gotoNextRecording('previous', 'any', ['interesting'])">
      <font-awesome-icon
        icon="asterisk"
        style="color: red"
        transform="up-24 right-10 shrink-3"
        value="?" />
      <font-awesome-icon
        class="fa-3x"
        icon="angle-double-left" />
    </span>
    <span
      title="Previous for device, not manually tagged"
      @click="gotoNextRecording('previous', 'no-human')">
      <font-awesome-icon
        icon="question"
        style="color: green"
        transform="up-24 right-10 shrink-3"
        value="?" />
      <font-awesome-icon
        class="fa-3x"
        icon="angle-left" />
    </span>
    <span
      title="Previous for device"
      @click="gotoNextRecording('previous', 'any')">
      <font-awesome-icon
        icon="angle-left"
        class="fa-3x" />
    </span>
    <span
      title="Next for device"
      @click="gotoNextRecording('next', 'any')">
      <font-awesome-icon
        icon="angle-right"
        class="fa-3x" />
    </span>
    <span
      title="Next for device, not manually tagged"
      @click="gotoNextRecording('next', 'no-human')">
      <font-awesome-icon
        class="fa-3x"
        icon="angle-right" />
      <font-awesome-icon
        icon="question"
        style="color: green"
        transform="up-24 left-10 shrink-3"
        value="?" />
    </span>
    <span
      title="Next for device, skipping birds &amp; false-positives"
      @click="gotoNextRecording('next', 'any', ['interesting'])">
      <font-awesome-icon
        class="fa-3x"
        icon="angle-double-right" />
      <font-awesome-icon
        icon="asterisk"
        style="color: red"
        transform="up-24 left-10 shrink-3"
        value="?" />
    </span>
  </div>
</template>

<script>

export default {
  name: 'PrevNext',
  props: {
    recording: {
      type: Object,
      default: function () {
        return {};
      }
    }
  },
  methods: {
    async gotoNextRecording(direction, tagMode, tags, skipMessage) {
      if (await this.getNextRecording(direction, tagMode, tags, skipMessage)) {
        this.$router.push({path: `/recording/${this.recording.id}`});
      }
    },
    async getNextRecording(direction, tagMode, tags, skipMessage) {
      let where = {
        DeviceId: this.recording.Device.id
      };

      let order;
      switch (direction) {
      case "next":
        where.recordingDateTime = {"$gt": this.recording.recordingDateTime};
        order = "ASC";
        break;
      case "previous":
        where.recordingDateTime = {"$lt": this.recording.recordingDateTime};
        order = "DESC";
        break;
      case "either":
        if (await this.getNextRecording('next', tagMode, tags, true)) {
          return true;
        }
        return await this.getNextRecording('previous', tagMode, tags, skipMessage);
      default:
        throw `invalid direction: '${direction}'`;
      }
      order  = JSON.stringify([["recordingDateTime", order]]);
      where = JSON.stringify(where);

      const params ={
        where,
        order,
        limit: 1,
        offset: 0
      };

      if (tags) {
        params.tags = JSON.stringify(tags);
      }
      if (tagMode) {
        params.tagMode = tagMode;
      }

      return await this.$store.dispatch('Video/QUERY_RECORDING', { params, direction, skipMessage });
    },
  },
};
</script>

<style scoped>
.img-buttons {
  padding: 1em;
  text-align: center;
}
.img-buttons
  span {
    cursor: pointer;
    width: 4em;
    max-height: 4em;
    box-sizing: border-box;
    display: inline-block;
    opacity: 0.6;
  }
  span:hover {
    opacity: 1;
  }
</style>
