<template>
  <b-modal
    :id="refTag"
    title="Add track tag"
    @ok="quickTag()">
    <b-form>
      <b-form-group
        label="Animal:"
        horizontal>
        <b-form-select
          v-model="whatTag"
          :options="whatOptions" />
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

export default {
  name: 'AddCustomTrackTag',
  props: {
    refTag: {
      type: String,
      required: true,
    }
  },
  data () {
    return {
      whatTag: "cat",
      whatOptions: [
        {value: null, text: 'Choose an animal'}, "bird", "bird/kiwi", "rat", "possum", "hedgehog", "stoat", "cat", "dog", "rabbit", "human", "insect", "other", "part of animal (eg tail)", "unidentified"
      ],
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