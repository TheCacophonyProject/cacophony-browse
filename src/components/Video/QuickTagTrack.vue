<template>
  <div class="tag-buttons">
    <div class="tag-category">
      <h6>Animals</h6>
      <div class="tag-btns-wrapper animals">
        <button
          v-for="animal in animals"
          :key="animal"
          :class="['btn btn-light btn-tag equal-flex', getClass(animal)]"
          @click="quickTag(animal)"
        >
          <img
            onerror="this.style.display='none'"
            :title="getTitle(animal)"
            :src="imgSrc(animal)"
          />
          <div class="tag-name">{{ animal }}</div>
        </button>
      </div>
    </div>

    <div class="tag-category">
      <h6>Other</h6>
      <div class="tag-btns-wrapper other">
        <button
          v-for="otherTag in otherTags"
          :key="otherTag.value"
          :class="[
            'btn btn-light btn-tag equal-flex other-width',
            getClass(otherTag.value)
          ]"
          @click="quickTag(otherTag.value)"
        >
          <img
            onerror="this.style.display='none'"
            :title="getOtherTitle(otherTag.value)"
            :src="imgSrc(otherTag.value)"
          />
          <div class="tag-name">{{ otherTag.text }}</div>
        </button>
        <button
          v-b-modal="'custom-track-tag'"
          class="btn btn-light btn-tag equal-flex"
        >
          <img title="Open form to add other tag" src="/plus.png" />
          <div class="tag-name">other...</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import DefaultLabels, { imgSrc } from "../../const.js";
export default {
  name: "QuickTagTrack",
  props: {
    tags: {
      type: Array,
      required: true
    }
  },
  watch: {
    tags: function() {
      this.filterTags();
    }
  },
  created: function() {
    this.filterTags();
  },
  data() {
    return {
      userTags: [],
      animals: DefaultLabels.quickTagLabels(),
      otherTags: DefaultLabels.otherTagLabels(),
      message: ""
    };
  },
  methods: {
    imgSrc,
    filterTags() {
      this.userTags = this.tags.filter(
        tag =>
          tag.User &&
          tag.User.username == this.$store.state.User.userData.username
      );
    },
    quickTag(what) {
      var found = this.userTags.find(function(tag) {
        return tag.what == what;
      });

      if (found) {
        this.$emit("deleteTag", found);
        return;
      }

      const tag = {};
      tag.confidence = 0.85;
      tag.what = what;
      this.$emit("addTag", tag);
    },
    getOtherTitle(other) {
      if (other == DefaultLabels.allLabels.falsePositive.value) {
        return "Mark as nothing or false positive (meaning there is no animal)";
      } else if (other == DefaultLabels.allLabels.unknown.value) {
        return "Mark as unknown (meaning the type of animal is unclear)";
      }
    },
    getTitle(animal) {
      return "Mark as " + animal;
    },
    getClass(animal) {
      let buttonClass = "tag-div";
      var userTag = this.userTags.find(function(tag) {
        return tag.what == animal;
      });

      if (userTag) {
        buttonClass += " tagged active";
      }
      var aiTag = this.tags.find(function(tag) {
        return tag.what == animal && tag.automatic;
      });

      if (aiTag) {
        buttonClass += " ai-tagged active";
      }
      return buttonClass;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../styles/tag-colours";

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
  .equal-flex {
    flex: 1 1 0px;
  }
  .btn-tag {
    padding-left: 0.2em;
    padding-right: 0.2em;
    min-width: 58.17px;
    img {
      max-width: 44px;
    }
    .tag-name {
      font-size: 0.7em;
    }
    &.tagged {
      border: 2px solid $human !important;
    }
    &.ai-tagged {
      border: 2px solid $ai !important;
    }
    &.ai-tagged.tagged {
      border: 2px solid $aihuman !important;
    }
  }
}
</style>
