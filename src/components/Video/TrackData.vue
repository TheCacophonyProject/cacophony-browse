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
        v-for="(track, index) in tracks"
        :key="index"
        class="tracks">
        <h3>{{ index + 1 }} - {{ track.label }}</h3>
        <div class="details">
          <p><span class="title">Time:</span> {{ track.start_s }} - {{ track.end_s }}s</p>
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
        </div>
      </div>
    </div>
  </div>

</template>

<script>
export default {
  name: 'TrackData',
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
  methods: {
    hideResults(track) {
      this.display_all.splice(this.display_all.indexOf(track), 1);
    },
    showResults(track) {
      this.display_all.push(track);
    },
  }
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
</style>
