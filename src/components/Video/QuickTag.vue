<template>
  <div>
    <img
      class="tag-button"
      title="Mark as possum"
      src="../../assets/video/possum.png"
      @click="tags.quickNew('possum')" >
    <img
      class="tag-button"
      title="Mark as stoat"
      src="../../assets/video/stoat.png"
      @click="tags.quickNew('stoat')" >
    <img
      class="tag-button"
      title="Mark as rat"
      src="../../assets/video/rat.png"
      @click="tags.quickNew('rat')" >
    <img
      class="tag-button"
      title="Mark as hedgehog"
      src="../../assets/video/hedgehog.png"
      @click="tags.quickNew('hedgehog')" >
    <img
      class="tag-button"
      title="Mark as cat"
      src="../../assets/video/cat.png"
      @click="tags.quickNew('cat')" >
    <img
      class="tag-button"
      title="Mark as human"
      src="../../assets/video/human.png"
      @click="tags.quickNew('human')" >
    <img
      class="tag-button"
      title="Mark as bird"
      src="../../assets/video/bird.png"
      @click="tags.quickNew('bird')" >
    <img
      class="tag-button"
      title="Mark as kiwi"
      src="../../assets/video/kiwi.png"
      @click="tags.quickNew('bird/kiwi')" >
    <img
      class="tag-button"
      title="Mark as unidentified (meaning the type of animal is unclear)"
      src="../../assets/video/unknown.png"
      @click="tags.quickNew('unidentified')" >
    <img
      class="tag-button"
      title="Mark as false positive (meaning there is no animal present)"
      src="../../assets/video/none.png"
      @click="falsePositive()" >
    <img
      class="tag-button"
      title="Open form to add other animal and/or extra details"
      src="../../assets/video/plus.png"
      @click="toggleTaggingDetails()" >
  </div>
</template>

<script>

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'QuickTag',
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {},
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data () {
    return {

    };
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {

  },
};
</script>

<style scoped>
.tag-button {
  max-width: 15%;
  max-height: 75px;
  width: auto;
  height: auto;
  cursor: pointer;
}
</style>
