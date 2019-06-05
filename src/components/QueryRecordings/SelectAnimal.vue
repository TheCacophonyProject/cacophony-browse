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
      label="name" 
      track-by="name"
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
    },
    canHaveSubTags: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      options: [
        {name: "interesting"},
        {name: "possum"},
        {name: "rat"},
        {name: "stoat"},
        {name: "hedgehog"},
        {name: "cat"},
        {name: "bird"},
        {name: "bird/kiwi"},
        {name: "dog"},
        {name: "hare"},
        {name: "human"},
        {name: "insect"},
        {name: "rabbit"},
        {name: "spider"},
        {name: "other"},
        {name: "unidentified"},
        {name: "pest"},
        {value: "part", name: 'part of animal (eg tail)'},
        {value: "bad track", name: 'poor tracking'},      
      ]
    };
  },
  computed: {
    placeholder: function () {
      if (this.value.length > 0) {
        return "add more animals";
      } else if (this.canHaveSubTags) {
        return "anything";
      } else {
        return "";
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
