<template>
  <div class="details">
    <p>
      <span class="title">Time:</span> {{ trackData.start_s }} - {{ trackData.end_s }}s
      <span class="delta"> ({{ (trackData.end_s - trackData.start_s) | currency('', 1) }}s) </span>
    </p>
    <p>
      <span class="title">Confidence:</span>
      {{ trackData.confidence }} <span class="delta">(&#916; {{ trackData.clarity }})</span>
      <span
        v-if="!display_all"
        title="Show all result classes"
        @click="display_all=true">
        <font-awesome-icon
          icon="angle-down"
          class="fa-1x"/>
      </span>
      <span
        v-if="display_all"
        title="Hide other results"
        @click="display_all=false">
        <font-awesome-icon
          icon="angle-down"
          class="fa-1x"/>
      </span>
    </p>
    <table
      v-if="display_all">
      <thead>
        <tr><th>Animal</th><th>Confidence</th></tr>
      </thead>
      <tr
        v-for="(value, animal) in trackData.all_class_confidences"
        :key="animal">
        <td>{{ animal }}</td>
        <td>{{ value }}</td>
      </tr>
    </table>
    <p><span class="title">Novelty:</span> {{ trackData.average_novelty }}</p>
    <p v-if="trackData.message"><span class="title">Message:</span> {{ trackData.message }}</p>
  </div>
</template>

<script>
import Vue2Filters from 'vue2-filters';

export default {
  name: 'TrackData',
  mixins: [Vue2Filters.mixin],
  props: {
    trackData: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      display_all: false,
    };
  },
  computed: {
    orderedTracks: function () {
      return this.tracks.slice().sort((a, b) => a.start_s - b.start_s );
    }
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
