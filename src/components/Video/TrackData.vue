<template>
  <div>
    <h3>Tracks &nbsp;
      <span
        v-if="!display"
        title="Show all track data"
        @click="display=true">
        <font-awesome-icon
          icon="angle-down"
          class="fa-1x"/>
      </span>
      <span
        v-if="display"
        title="Hide all track data"
        @click="display=false">
        <font-awesome-icon
          icon="angle-up"
          class="fa-1x"/>
      </span>
    </h3>
    <div
      v-if="display">
      <div
        v-for="(track, index) in orderBy(tracks, 'start_s')"
        :key="index"
        :class="trackClass(track.status)"
        class="tracks">
        <h3>
          <span v-html="trackImage(track.status, track.label)"/>
          {{ index + 1 }} - {{ track.label }}</h3>
        <div class="details">
          <p>
            <span class="title">Time:</span> {{ track.start_s }} - {{ track.end_s }}s
            <span class="delta"> ({{ (track.end_s - track.start_s) | currency('', 1) }}s) </span>
          </p>
          <p>
            <span class="title">Confidence:</span>
            {{ track.confidence }} <span class="delta">(&#916; {{ track.clarity }})</span>
            <span
              v-if="!display_all.includes(track)"
              title="Show all result classes"
              @click="showResults(track)">
              <font-awesome-icon
                icon="angle-down"
                class="fa-1x"/>
            </span>
            <span
              v-if="display_all.includes(track)"
              title="Hide other results"
              @click="hideResults(track)">
              <font-awesome-icon
                icon="angle-down"
                class="fa-1x"/>
            </span>
          </p>
          <table
            v-if="display_all.includes(track)">
            <thead>
              <tr><th>Animal</th><th>Confidence</th></tr>
            </thead>
            <tr
              v-for="(value, animal) in track.all_class_confidences"
              :key="animal">
              <td>{{ animal }}</td>
              <td>{{ value }}</td>
            </tr>
          </table>
          <p><span class="title">Novelty:</span> {{ track.average_novelty }}</p>
          <p v-if="track.message"><span class="title">Message:</span> {{ track.message }}</p>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
/* global require */

import Vue2Filters from 'vue2-filters';

export default {
  name: 'TrackData',
  mixins: [Vue2Filters.mixin],
  props: {
    tracks: {
      type: Array,
      required: true
    },
  },
  data() {
    return {
      display: false,
      display_all: []
    };
  },
  computed: {
    orderedTracks: function () {
      return this.tracks.slice().sort((a, b) => a.start_s - b.start_s );
    }
  },
  methods: {
    hideResults(track) {
      this.display_all.splice(this.display_all.indexOf(track), 1);
    },
    showResults(track) {
      this.display_all.push(track);
    },
    trackClass: function (status) {
      if ((status == 'tag') || (status == 'unknown')) {
        return "";
      } else {
        return "ignored";
      }
    },
    trackImage: function (status, animal) {
      // Struggling to get images to show correctly so using work-around
      // suggested at bottom of this page.
      // TODO implement alternative that doesn't use 'require' in this manner
      // https://bootstrap-vue.js.org/docs/reference/images/
      let image = null;
      if (status == 'tag') {
        image = animal + '.png';
      } else if (status == 'unknown') {
        image = 'unknown.png';
      }

      try {
        const link = require('../../assets/video/' + image);
        return `<img class="track-image" src="${link}" />`;
      } catch (e) {
        return `<img class="track-image"/>`;
      }
    },
  },
};
</script>

<style scoped>
  .tracks {
    padding-left: 20px;
  }

  .tracks h3 {
    margin-bottom: 0;
  }

  .details {
    padding-left: 20px;
    padding-bottom: 5px;
  }

  table {
    margin: 10px 30px;
    border-bottom: 1px solid #ddd;
  }

  th, td {
    border-top: 1px solid #ddd;
  }

  td {
    padding-right: 20px;
  }

  .title {
    font-weight: 550;
  }

  .details p {
    margin-bottom: 0;
  }

  .delta {
    color: gray;
  }

  .ignored {
    color: gray;
  }
</style>

<style>
 .track-image {
    max-width: 30px;
    max-height: 30px;
    width: auto;
    height: auto;
 }
</style>
