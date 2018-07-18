

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
        <span v-html="animalImage(row.item.animal, row.item.event)"/>
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
          icon="trash"
          size="2x"/>
      </template>
    </b-table>
  </div>
</template>

<script>

/* global require */

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'ObservedAnimals',
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data () {
    return {
      fields: [
        {key: 'animalImage', label: ''},
        {key: 'animal', label: 'Animal'},
        {key: 'confidence', label: 'Confidence'},
        {key: 'who', label: 'By Who'},
        {key: 'when', label: 'When'},
        {key: 'additionalInfo', label: 'Additional Information'},
        {key: 'deleteButton', label: ''}
      ]
    };
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {
  },
  methods: {
    animalImage: function (animal, event) {
      // Struggling to get images to show correctly so using work-around
      // suggeested at bottom of this page
      // https://bootstrap-vue.js.org/docs/reference/images/
      let humanLink = require('../../assets/video/human.png');
      let possumLink = require('../../assets/video/possum.png');
      let noneLink = require('../../assets/video/none.png');
      let stoatLink = require('../../assets/video/stoat.png');
      let ratLink = require('../../assets/video/rat.png');
      let hedgehogLink = require('../../assets/video/hedgehog.png');
      let catLink = require('../../assets/video/cat.png');
      let birdLink = require('../../assets/video/bird.png');
      let kiwiLink = require('../../assets/video/kiwi.png');

      if (animal == 'none' && event == 'false positive') {
        return `<img class="animal-image" src="${noneLink}" />`;
      }
      switch(animal) {
      case "possum":
        return `<img class="animal-image" src="${possumLink}" />`;
      case "stoat":
        return `<img class="animal-image" src="${stoatLink}" />`;
      case "rat":
        return `<img class="animal-image" src="${ratLink}" />`;
      case "hedgehog":
        return `<img class="animal-image" src="${hedgehogLink}" />`;
      case "cat":
        return `<img class="animal-image" src="${catLink}" />`;
      case "human":
        return `<img class="animal-image" src="${humanLink}" />`;
      case "bird":
        return `<img class="animal-image" src="${birdLink}" />`;
      case "bird/kiwi":
        return `<img class="animal-image" src="${kiwiLink}" />`;
      case "unidentified":
        return `<img class="animal-image" src="${noneLink}" />`;
      default:
        return null;
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
