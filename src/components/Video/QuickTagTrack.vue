<template>
  <div class="tag-buttons">
    <div class="tag-category">
      <h6>Animals</h6>
      <div class="tag-btns-wrapper animals">
        <button
          v-for="(animal) in animals"
          :key="animal"
          :class="['btn btn-light btn-tag', getClass(animal)]"
          @click="quickTag(animal)">
          <img
            :title="getTitle(animal)"
            :src="getSrc(animal)">
          <div class="tag-name">{{ animal }}</div>
        </button>
      </div>
    </div>

    <div class="tag-category">
      <h6>Other</h6>
      <div class="tag-btns-wrapper other">
        <button
          :class="['btn btn-light btn-tag', getClass('unidentified')]"
          @click="quickTag('unidentified')">
          <img
            title="Mark as unidentified (meaning the type of animal is unclear)"
            src="../../assets/video/unknown.png">
          <div class="tag-name">unknown</div>
        </button>
        <div
          :class="['btn btn-light btn-tag', getClass('false-positive')]"
          @click="quickTag('false positive')">
          <img
            title="Mark as nothing or false positive (meaning there is no animal)"
            src="../../assets/video/none.png">
          <div class="tag-name">nothing</div>
        </div>
        <div
          v-b-modal="'custom-track-tag'"
          class="btn btn-light btn-tag">
          <img
            title="Open form to add other tag"
            src="../../assets/video/plus.png">
          <div class="tag-name">other...</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import DefaultLabels from "../../const.js";
export default {
  name: "QuickTagTrack",
  props: {
    tags: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      animals: DefaultLabels.quickTagLabels(),
      message: ""
    };
  },
  methods: {
    quickTag(what) {
      const tag = {};
      tag.confidence = 0.85;
      tag.what = what;
      this.$emit("addTag", tag);
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
            buttonClass += " tagged active";
          } else {
            buttonClass += " ai-tagged active";
          }
        }
      }
      return buttonClass;
    }
  }
};
</script>

<style lang="scss" scoped>
.tag-buttons {
  margin-bottom: 1.2rem;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  .tag-category {
    h6 {
      font-size: 0.75em;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 1em;
    }
  }
  .tag-btns-wrapper {
    display: flex;
    .btn {
      margin-right: 4px;
    }
    .btn:last-child {
      margin-right: 0;
    }
  }
  .btn-tag {
    padding-left: 0.2em;
    padding-right: 0.2em;
    img {
      max-width: 44px;
    }
    .tag-name {
      font-size: 0.7em;
    }
    &.tagged {
      border: 2px solid green !important;
    }
    &.ai-tagged {
      border: 2px solid gold !important;
    }
  }
}
</style>
