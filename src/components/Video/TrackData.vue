<template>
  <div class="details simple-accordion-wrapper">
    <h6 class="simple-accordion-header" @click="show_details = !show_details">
      Classifier details
      <span
        v-if="!show_details"
        title="Show all result classes"
        class="pointer"
      >
        <font-awesome-icon icon="angle-down" class="fa-1x" />
      </span>
      <span v-if="show_details" title="Hide other results" class="pointer">
        <font-awesome-icon icon="angle-up" class="fa-1x" />
      </span>
    </h6>
    <div v-if="show_details">
      <p><strong>Label:</strong> {{ trackData.label }}</p>
      <p>
        <strong>Confidence:</strong>
        {{ trackData.confidence }}
        <span class="delta">(&#916; {{ trackData.clarity }})</span>
      </p>
      <p><strong>Novelty:</strong> {{ trackData.average_novelty }}</p>
      <p v-if="trackData.message">
        <strong class="title">Message:</strong> {{ trackData.message }}
      </p>
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Animal</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tr
          v-for="(value, animal) in trackData.all_class_confidences"
          :key="animal"
        >
          <td>{{ animal }}</td>
          <td>{{ value }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "TrackData",
  props: {
    trackData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      show_details: false,
    };
  },
};
</script>

<style scoped>
.details {
  font-size: 85%;
}
h6 {
  cursor: pointer;
}
p {
  margin-bottom: 0.5em;
}
.table {
  margin-top: 1em;
}
</style>
