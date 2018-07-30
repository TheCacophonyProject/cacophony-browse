<template>
  <div>
    <img
      class="tag-button"
      title="Mark as possum"
      src="../../assets/video/possum.png"
      @click="quickTag('possum')" >
    <img
      class="tag-button"
      title="Mark as stoat"
      src="../../assets/video/stoat.png"
      @click="quickTag('stoat')" >
    <img
      class="tag-button"
      title="Mark as rat"
      src="../../assets/video/rat.png"
      @click="quickTag('rat')" >
    <img
      class="tag-button"
      title="Mark as hedgehog"
      src="../../assets/video/hedgehog.png"
      @click="quickTag('hedgehog')" >
    <img
      class="tag-button"
      title="Mark as cat"
      src="../../assets/video/cat.png"
      @click="quickTag('cat')" >
    <img
      class="tag-button"
      title="Mark as human"
      src="../../assets/video/human.png"
      @click="quickTag('human')" >
    <img
      class="tag-button"
      title="Mark as bird"
      src="../../assets/video/bird.png"
      @click="quickTag('bird')" >
    <img
      class="tag-button"
      title="Mark as kiwi"
      src="../../assets/video/kiwi.png"
      @click="quickTag('bird/kiwi')" >
    <img
      class="tag-button"
      title="Mark as unidentified (meaning the type of animal is unclear)"
      src="../../assets/video/unknown.png"
      @click="quickTag('unidentified')" >
    <img
      class="tag-button"
      title="Mark as false positive (meaning there is no animal present)"
      src="../../assets/video/none.png"
      @click="$emit('addTag', {event: 'false positive'})" >
    <img
      class="tag-button"
      title="Open form to add other animal and/or extra details"
      src="../../assets/video/plus.png"
      @click="$emit('displayAddObservation')" >
  </div>
</template>

<script>

export default {
  name: 'QuickTag',
  methods: {
    quickTag(animal) {
      const tag = {};
      tag.animal = animal;
      tag.confidence = 0.6;
      this.$emit('addTag', tag);
    }
  }
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
