<template>
  <b-modal id="custom-track-tag" title="Add track tag" @ok="quickTag">
    <b-form>
      <b-form-group label="Tag:" horizontal>
        <b-form-select v-model="whatTag" :options="whatOptions">
          <template slot="first">
            <option :value="null" disabled>Choose a tag.. </option>
          </template>
        </b-form-select>
      </b-form-group>

      <b-form-group label="Confidence:" horizontal>
        <b-form-radio-group v-model="confidence" :options="confidenceOptions" />
      </b-form-group>

      <b-form-group label="Comment:" horizontal>
        <b-form-input v-model="comment" />
      </b-form-group>
    </b-form>
  </b-modal>
</template>
<script>
import DefaultLabels from "../../const.js";

export default {
  name: "AddCustomTrackTag",
  props: {
    tags: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      whatTag: "cat",
      whatOptions: DefaultLabels.trackLabels(),
      confidence: 0.8,
      confidenceOptions: [
        { value: 0.4, text: "low" },
        { value: 0.6, text: "mid" },
        { value: 0.8, text: "high" }
      ],
      comment: ""
    };
  },
  methods: {
    quickTag() {
      const userTags = this.tags.filter(
        tag =>
          tag.User &&
          tag.User.username == this.$store.state.User.userData.username
      );

      const tag = {};
      tag.confidence = this.confidence;
      tag.what = this.whatTag;

      var found = userTags.find(function(uTag) {
        return uTag.what == tag.what;
      });

      if (found) {
        return;
      }
      const isAdditionalTag = DefaultLabels.isAdditionalTag(tag);
      if (!isAdditionalTag && userTags.length > 0) {
        const delTag = userTags.find(function(uTag) {
          return !DefaultLabels.isAdditionalTag(uTag);
        });
        if (delTag) {
          this.$emit("deleteTag", delTag);
        }
      }

      this.$emit("addTag", tag);
    }
  }
};
</script>
