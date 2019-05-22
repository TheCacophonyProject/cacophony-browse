<template>
  <b-modal
    :id="refTag"
    title="Add track tag"
    @ok="quickTag()">
    <b-form>
      <b-form-group
        label="Tag:"
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
        {value: null, text: 'Choose a tag...'},
        "possum",
        "hedgehog",
        {value: "rat", text: 'rat or mouse'},
        {value: "stoat", text: 'stoat, weasel or ferret (mustelid)'},
        "bird",
        "bird/kiwi",
        "cat",
        "dog",
        "rabbit",
        "human",
        {value: "insect", text: 'spider or insect (on camera lens or flying)'},
        {value: "pest", text: 'unidentified animal but not bird'},
        {value: "part", text: 'just part of animal (eg tail)'},
        {value: "bad track", text: 'poor tracking'},
        "other",
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