<template>
  <div>
    <SelectTagTypes v-model="mode" :disabled="isDisabled" />
    <SelectAnimal
      v-model="animals"
      :disabled="isDisabled"
      :can-have-sub-tags="canHaveTags"
    />
  </div>
</template>

<script>
import SelectTagTypes from "./SelectTagTypes.vue";
import SelectAnimal from "./SelectAnimal.vue";
import DefaultLabels from "../../const.js";

export default {
  name: "SelectTags",
  components: { SelectTagTypes, SelectAnimal },
  props: {
    isDisabled: {
      type: Boolean,
      required: true
    },
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      animalData: [],
      tagMode: "any"
    };
  },
  computed: {
    animals: {
      get: function() {
        return this.animalData;
      },
      set: function(value) {
        this.animalData = value;
        if (value.length > 0) {
          if (!this.canHaveTags) {
            this.tagMode = "tagged";
          }
        }
        this.updateValue();
      }
    },

    mode: {
      get: function() {
        return this.tagMode;
      },
      set: function(value) {
        this.tagMode = value;
        if (!this.canHaveTags) {
          this.animals = [];
        }
        this.updateValue();
      }
    },

    canHaveTags: function() {
      return this.canHaveSpecifiedTags(this.tagMode);
    }
  },
  mounted: function() {
    this.deserialise(this.value);
  },
  methods: {
    updateValue: function() {
      let returnVal = {};
      if (this.isDisabled) {
        returnVal = {
          tags: [],
          tagMode: "any",
          hasData: false
        };
      }

      returnVal = {
        tags: this.makeTagList(this.animalData),
        tagMode: this.tagMode,
        desciption: this.makeTagDescription()
      };
      this.$emit("input", returnVal);
    },
    deserialise(tagObject) {
      if (tagObject.hasOwnProperty("tagMode")) {
        this.tagMode = tagObject.tagMode;
      }
      if (
        tagObject.hasOwnProperty("tags") &&
        !this.arraysAreEqual(this.makeTagList(this.animalData), tagObject.tags)
      ) {
        this.animalData = tagObject.tags.map(tag =>
          DefaultLabels.searchLabels().find(({ value }) => tag === value)
        );
      }
    },
    makeTagList(tagObjects) {
      return tagObjects.map(option =>
        option.value ? option.value : option.text
      );
    },
    arraysAreEqual(a1, a2) {
      return JSON.stringify(a1) == JSON.stringify(a2);
    },
    canHaveSpecifiedTags: DefaultLabels.canHaveSpecifiedTags,
    makeTagDescription() {
      const numanimalData = this.animalData.length;
      const multipleanimalDatauffix = numanimalData > 1 ? "s" : "";
      return numanimalData === 0
        ? "all animalData"
        : `${numanimalData} animal${multipleanimalDatauffix}`;
    }
  },

  watch: {
    serialisedData: function(value) {
      this.$emit("input", value);
    },
    value: function(val) {
      this.deserialise(val);
    }
  }
};
</script>
