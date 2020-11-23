<template>
  <div class="AIClassification">
    <h6>AI classification:</h6>
    <div>
      <span v-if="aiGuess.length > 0">
        <img
          onerror="this.style.display='none'"
          :src="imgSrc(aiGuess[0].what)"
          class="tag-img"
        />
        {{ aiGuess[0].what }}
      </span>
      <span v-else>
        none
      </span>
    </div>
  </div>
</template>

<script>
import { imgSrc } from "../../const.js";

export default {
  name: "AIClassification",
  props: {
    tags: {
      type: Array,
      required: true
    },
    isWallabyProject: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    model() {
      if (this.isWallabyProject) {
        return "Wallaby-Movement";
      }
      return "Resnet";
    },
    aiGuess() {
      return this.tags.filter(tag => tag.data && tag.data.name === this.model);
    }
  },
  methods: {
    imgSrc
  }
};
</script>

<style scoped>
h6 {
  font-size: 0.75em;
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 1em;
}
.tag-img {
  max-width: 30px;
  max-height: 30px;
  margin-right: 0.2rem;
}
</style>
