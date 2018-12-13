<template>
  <b-form-group
    v-b-tooltip.hover="tooltipTitle">
    <label>Animals</label>
    <multiselect
      :value="value"
      :options="options"
      :multiple="true"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="$emit('input', $event)"/>
  </b-form-group>
</template>

<script>

export default {
  name: 'AnimalSelect',
  props: {
    value: {
      type: Array,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      options: [
        "interesting",
        "possum",
        "rat",
        "stoat",
        "ferret",
        "weasel",
        "hedgehog",
        "cat",
        "bird",
        "bird/kiwi",
        "dog",
        "hare",
        "human",
        "insect",
        "mouse",
        "rabbit",
        "spider",
        "other",
        "unidentified",
      ]
    };
  },
  computed: {
    placeholder: function () {
      if (this.value.length > 0) {
        return "add more animals";
      } else {
        return "all animals";
      }
    },
    tooltipTitle: function () {
      if (this.disabled) {
        return 'Disabled when recording type includes audio';
      } else {
        return "";
      }
    }
  },
};

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
