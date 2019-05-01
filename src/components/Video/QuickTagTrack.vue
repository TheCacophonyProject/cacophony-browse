<template>
  <div class="tag-buttons">
    <div
      v-for="(animal) in animals"
      :key="animal"
      :class="getClass(animal)"
      @click="quickTag(animal)">
      <img
        :title="getTitle(animal)"
        :src="getSrc(animal)">
      <div class="tag-name">{{ animal }}</div>
    </div>
    <div
      :class="getClass('unidentified')"
      @click="quickTag('unidentified')">
      <img
        title="Mark as unidentified (meaning the type of animal is unclear)"
        src="../../assets/video/unknown.png">
      <div class="tag-name">unknown</div>
    </div>
    <div
      :class="getClass('false-positive')"
      @click="quickTag('false positive')">
      <img
        title="Mark as nothing or false positive (meaning there is no animal)"
        src="../../assets/video/none.png">
      <div class="tag-name">nothing</div>
    </div>
    <div
      v-b-modal="addRef"
      class="tag-div">
      <img
        class="tag-button"
        title="Open form to add other tag"
        src="../../assets/video/plus.png">
      <div class="tag-name">other...</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickTagTrack',
  props: {
    addRef: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
      required: true
    },
  },
  data() {
    return {
      animals: ["possum", "rat", "hedgehog", "cat", "bird"],
      message: "",
    };
  },
  methods: {
    quickTag(what) {
      const tag = {};
      tag.confidence = 0.85;
      tag.what = what;
      this.$emit('addTag', tag);
    },
    getTitle(animal) {
      return "Mark as " + animal;
    },
    getSrc(animal) {
      return "/" + animal + ".png";
    },
    getClass(animal) {
      let buttonClass = "tag-div";
      for (const tag of this.tags) {
        if (tag.what == animal) {
          if (tag.automatic == false) {
            buttonClass  += " tagged";
          } else {
            buttonClass += " ai-tagged";
          }
        }
      }
      return buttonClass;
    }
  }
};
</script>

<style scoped>
.tag-div {
  width: 3.5em;
  max-height: 5em;
  display: inline-block;
}

.tag-buttons {
  padding: 1em;
  text-align: center;
}

.tag-div >>> div {
  font-size: 80%
}

.tag-div >>> img {
  box-sizing: border-box;
  width: 3em;
  max-height: 3em;
  cursor: pointer;
}
</style>
<style>
div.tagged {
  border: 2px solid green;
  margin: 2px;
}

.ai-tagged {
  border: 2px solid gold;
  margin: 2px;
}

</style>
