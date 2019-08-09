<template>
  <b-modal
    id="custom-track-tag"
    title="Add track tag"
    @ok="quickTag">
    <b-form>
      <b-form-group
        label="Tag:"
        horizontal>
        <b-form-select
          v-model="whatTag"
          :options="whatOptions">
          <template slot="first">
            <option
              :value="null"
              disabled>Choose a tag..
            </option>
          </template>
        </b-form-select>
      </b-form-group>

      <b-form-group
        label="Confidence:"
        horizontal>
        <b-form-radio-group
          v-model="confidence"
          :options="confidenceOptions" />
      </b-form-group>

      <b-form-group
        label="Comment:"
        horizontal>
        <b-form-input v-model="comment"/>
      </b-form-group>
    </b-form>
  </b-modal>
</template>
<script>
import DefaultLabels from '../../const.js';

export default {
  name: 'AddCustomTrackTag',
  data () {
    return {
      whatTag: "cat",
      whatOptions: DefaultLabels.trackLabels(),
      confidence: 0.8,
      confidenceOptions: [
        {value: 0.4, text: "low"},
        {value: 0.6, text: "mid"},
        {value: 0.8, text: "high"}
      ],
      comment: "",
    };
  },
  methods: {
    quickTag() {
      const tag = {};
      tag.confidence = this.confidence;
      tag.what = this.whatTag;
      this.$emit('addTag', tag);
    }
  }
};
</script>
