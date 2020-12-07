<template>
  <div class="AIClassification">
    <h6>AI classification:</h6>
    <div
      :class="[
        'classification',
        { 'guess-is-good': !needsConfirmation && aiGuessIsSameAsSomeUser },
        {
          'guess-is-bad': !needsConfirmation && aiGuessIsDifferentFromSomeUser
        },
        {
          'guess-is-contentious':
            !needsConfirmation &&
            aiGuessIsDifferentFromSomeUser &&
            aiGuessIsSameAsSomeUser
        }
      ]"
    >
      <div v-if="aiGuess" class="guess-row">
        <div>
          <img
            onerror="this.style.display='none'"
            :src="imgSrc(aiGuess.what)"
            class="tag-img"
            :data-model="aiGuess.data.name"
          />
          <span>{{ aiGuess.what }}</span>
        </div>
        <div v-if="needsConfirmation" class="confirmation">
          <b-button variant="outline-success" size="sm" @click="confirm">
            <font-awesome-icon icon="thumbs-up" />
            <span>Confirm</span>
          </b-button>
          <b-button variant="outline-secondary" size="sm" @click="reject">
            <font-awesome-icon icon="thumbs-down" />
          </b-button>
        </div>
        <div v-else class="confirmation">
          <div>
            <font-awesome-icon
              v-if="aiGuessIsSameAsSomeUser"
              icon="check-circle"
            />
            <span v-if="agreeingUsersCount > 1"
              >({{ agreeingUsersCount }})</span
            >
          </div>
          <div>
            <font-awesome-icon
              v-if="aiGuessIsDifferentFromSomeUser"
              icon="times-circle"
            />
            <span v-if="disagreeingUsersCount > 1"
              >({{ disagreeingUsersCount }})</span
            >
          </div>
        </div>
      </div>
      <div v-else>
        none
      </div>
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
    },
    needsConfirmation: {
      type: Boolean,
      default: false
    },
    userTags: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    aiGuess() {
      return classifyTrack(this.tags, this.isWallabyProject);
    },
    aiGuessIsSameAsSomeUser() {
      return (
        this.userTags.length !== 0 && this.userTags.includes(this.aiGuess.what)
      );
    },
    aiGuessIsDifferentFromSomeUser() {
      return (
        this.userTags.length !== 0 && !this.userTags.includes(this.aiGuess.what)
      );
    },
    agreeingUsersCount() {
      return this.userTags.filter(tag => tag === this.aiGuess.what).length;
    },
    disagreeingUsersCount() {
      return this.userTags.filter(tag => tag === !this.aiGuess.what).length;
    }
  },
  methods: {
    imgSrc,
    confirm() {
      this.$emit("confirm-ai-guess", this.aiGuess);
    },
    reject() {
      this.$emit("reject-ai-guess");
    }
  }
};
</script>

<style scoped lang="scss">
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
.classification {
  &.guess-is-good {
    color: forestgreen;
  }
  &.guess-is-bad {
    color: darkred;
  }
  &.guess-is-contentious {
    color: saddlebrown;
  }
  .btn {
    > span {
      font-size: smaller;
    }
  }
}
.guess-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
