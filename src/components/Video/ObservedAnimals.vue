<template>
  <div>
    <div class="video-tags">
      <b-row>
        <b-col
          sm="3">
          <b-button
            v-b-tooltip.hover.bottomleft="'Mark this as a cool or interesting recording'"
            type="button"
            variant="success"
            block
            @click="addCoolTag">
            Cool Video
          </b-button>
        </b-col>
        <b-col
          sm="3">
          <b-button
            v-b-tooltip.hover.bottomleft="'Indicate that one or more animals do not have a corresponding track in this recording'"
            type="button"
            variant="warning"
            block
            @click="addMissedTrackTag">
            Missed track
          </b-button>
        </b-col>
      </b-row>

      <b-table
        v-if="items.length > 0"
        :items="items"
        :fields="fields"
        class="pt-3"
        striped
        hover
        responsive>
        <template
          slot="additionalInfo"
          slot-scope="row">
          <span v-html="additionalInfo(row.item.tag)"/>
        </template>
        <template
          slot="deleteButton"
          slot-scope="row">
          <font-awesome-icon
            v-b-tooltip.hover.left="'Delete'"
            icon="trash"
            size="2x"
            style="cursor: pointer;"
            @click="$emit('deleteTag', row.item.tag.id)"/>
        </template>
      </b-table>
    </div>
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
    },
  },
  data () {
    return {
      fields: [
        {key: 'animal', label: 'Animal'},
        {key: 'additionalInfo', label: 'Additional Information'},
        {key: 'who', label: 'By'},
        {key: 'when', label: 'When'},
        {key: 'deleteButton', label: ''},
        {key: 'confirmButton', label: ''}
      ]
    };
  },
  computed: {
  },
  methods: {
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
    addCoolTag: function () {
      this.$emit('addTag', {
        detail: "cool",
        confidence: 0.9
      });
    },
    addMissedTrackTag: function () {
      this.$emit('addTag', {
        detail: "missed track",
        confidence: 0.9
      });
    }
  }
};
</script>

<style scoped>
.tags-header {
  margin-top: 20px;
}

.video-tags {
  position: relative;
}

.tag-button.btn {
  background: white;
  color: black;
  font-size: 80%;
  padding: 0;
  border-width: 1px;
  position: absolute;
  z-index: 100;
}

.add-image {
  max-width: 50px;
  max-height: 50px;
  width: auto;
  height: auto;
}
</style>
