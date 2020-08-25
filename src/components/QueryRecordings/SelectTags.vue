<template>
  <div>
    <SelectTagTypes v-model="tagType" :disabled="isDisabled" />
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
        required: true,
    },
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      animals: [],
      tagType: "any",
    };
  },
  computed: {
    canHaveTags: function() {
        return this.canHaveSpecifiedTags(this.tagType);
    },
    serialisedData: function () {
        if (this.isDisabled) {
            return {
                tags: [],
                tagMode: "any",
                hasData: false
            };
        }

        return {
            tags: this.makeTagList(this.animals),
            tagMode: this.tagType,
            hasData: ((this.tagType !== "any") || (this.animals.length > 1))
        };
    }
  },
  methods: {
    deserialise(tagObject) {
        if (tagObject.hasOwnProperty("tagMode")) {
            this.tagType = tagObject.tagMode;
        }
        if (tagObject.hasOwnProperty("tags") && 
            !this.arraysAreEqual(this.makeTagList(this.animals), tagObject.tags)) {
            this.animals = tagObject.tags;
        }
    },
    makeDateDescription() {
      return "blah blah animals";
    },
    makeTagList(tagObjects) {
        return tagObjects.map(option =>
                    option.value ? option.value : option.text);
    },
    arraysAreEqual(a1, a2) {
        return(JSON.stringify(a1)==JSON.stringify(a2));
    },
    canHaveSpecifiedTags: DefaultLabels.canHaveSpecifiedTags,
  },
      // this.animals = this.query.tags.map(tag =>
      //   DefaultLabels.searchLabels().find(({ value }) => tag === value)
      // );

  watch: {
    serialisedData: function (val) {
      this.$emit("input", this.serialisedData);
    },
    value: function (val) {
      this.deserialise(val);
    },
    animals: function (val) {
        const hasSpecifiedTags = this.rawAnimals > 0;
        if (hasSpecifiedTags) {
            if (!this.canHaveTags()) {
                this.tagType = "tagged";
            }
        }
    },
    tagType: function (val) {
        if (!this.canHaveSpecifiedTags(val)) {
            this.animals = "";
        }
    }
  }
};
</script>
