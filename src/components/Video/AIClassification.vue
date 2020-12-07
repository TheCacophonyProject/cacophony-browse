<template>
  <div class="AIClassification">
    <h6>AI classification:</h6>
    <div>
      <span v-if="aiGuess">
        <img
          onerror="this.style.display='none'"
          :src="imgSrc(aiGuess.what)"
          class="tag-img"
          :data-model="aiGuess.data.name"
        />
        {{ aiGuess.what }}
      </span>
      <span v-else>
        none
      </span>
    </div>
  </div>
</template>

<script>
import { imgSrc } from "../../const.js";
import { classifyTrack } from "../../classification.js";

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
    aiGuess() {
      return classifyTrack(this.tags, this.isWallabyProject);
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
