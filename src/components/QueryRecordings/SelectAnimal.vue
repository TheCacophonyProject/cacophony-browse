<template>
  <b-form-group>
    <label>Animals</label>
    <multiselect
      :value="value"
      :options="options"
      :multiple="true"
      :placeholder="placeholder"
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
    }
  },
  data () {
    return {
      thisvalue: ["interesting", "possum"],
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
        "false-positive",
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
    }
  },
};

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
