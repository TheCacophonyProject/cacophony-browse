

<template>
  <div>
    <b-table
      :items="items"
      :fields="fields"
      striped
      hover
      responsive>
      <template
        slot="animalImage"
        slot-scope="row">
        <span v-html="animalImage(row.item.animal)"/>
      </template>
      <template
        slot="additionalInfo"
        slot-scope="row">
        <span v-html="additionalInfo(row.item.tag)"/>
      </template>
      <template
        slot="deleteButton"
        slot-scope="row">
        <font-awesome-icon
          v-b-popover.hover.bottom="'Delete tag'"
          icon="trash"
          size="2x"
          style="cursor: pointer;"
          @click="$emit('deleteTag', row.item.tag.id)"/>
      </template>
      <template
        slot="confirmButton"
        slot-scope="row">
        <font-awesome-icon
          v-b-popover.hover.bottom="'Confirm the automatic tag'"
          v-if="row.item.tag.automatic && row.item.tag.animal !== 'unidentified'"
          icon="check-circle"
          size="2x"
          style="cursor: pointer;"
          @click="confirmTag(row.item)"/>
      </template>
    </b-table>
  </div>
</template>

<script>

/* global require */

export default {
  name: 'ObservedAnimals',
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      fields: [
        {key: 'animalImage', label: ''},
        {key: 'animal', label: 'Animal'},
        {key: 'confidence', label: 'Confidence'},
        {key: 'who', label: 'By Who'},
        {key: 'when', label: 'When'},
        {key: 'additionalInfo', label: 'Additional Information'},
        {key: 'deleteButton', label: ''},
        {key: 'confirmButton', label: ''}
      ]
    };
  },
  computed: {
  },
  methods: {
    animalImage: function (animal) {
      // Struggling to get images to show correctly so using work-around
      // suggested at bottom of this page.
      // TODO implement alternative that doesn't use 'require' in this manner
      // https://bootstrap-vue.js.org/docs/reference/images/
      let image = null;
      if (animal == 'none') {
        image = 'none.png';
      } else if (animal == 'bird/kiwi') {
        image = 'kiwi.png';
      } else if (animal == 'unidentified') {
        image = 'none.png';
      } else {
        image = animal + '.png';
      }
      try {
        const link = require('../../assets/video/' + image);
        return `<img class="animal-image" src="${link}" />`;
      } catch (e) {
        return '';
      }
    },
    additionalInfo: function (tag) {
      let string = "";

      if (tag.number != null && tag.number > 1.5) {
        string += "<p> Number of animals is '" + tag.number + "'</p>";
      }

      if (tag.event != null && tag.event != "just wandering about") {
        string += "<p> Event is '<i>" + tag.event + "'</i></p>";
      }

      if (tag.trapType != null && tag.trapType != "") {
        string += "<p> Trap type is '<i>" + tag.trapType + "'</i></p>";
      }

      if (tag.age != null && tag.age != "") {
        string += "<p> Age is " + tag.age + "</p>";
      }

      if (tag.startTime != null || tag.duration != null) {
        if (tag.startTime == null) {
          tag.startTime == 0;
        }
        var timestring = "<p>Animal visible from " + (tag.startTime);
        if (tag.duration != null) {
          timestring += "&nbsp;-&nbsp;" + (tag.startTime + tag.duration); //tags.displayTime
        }
        timestring += "</p>";
        string += timestring;
      }
      return string;
    },
    confirmTag: function (rowItem) {
      const animal = rowItem.animal;
      const event = rowItem.event;
      const tag = {};
      if (event === 'false positive') {
        tag.event = 'false positive';
      } else {
        tag.animal = animal;
      }
      tag.confidence = rowItem.confidence;
      this.$emit('addTag', tag);
    }
  },
};
</script>

<style>
.animal-image {
  max-width: 50px;
  max-height: 50px;
  width: auto;
  height: auto;
}
</style>
