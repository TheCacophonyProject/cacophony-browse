<template>
  <b-container fluid>
    <b-col>
      <MetricsSearchParams @submit="querySubmitted" />
      <b-row class="visits-progress" v-if="queryPending">
        <h3>Calculating visits....</h3>
      </b-row>
      <b-row class="visits-progress" v-if="queryPending">
        <b-progress :value="pendingProgress" :max="1"></b-progress>
      </b-row>
      <b-row id="matrix" :class="allCategoriesMatrix ? '' : 'disabled'">
        <h2>
          Results ({{
            results && results.filteredVisits
              ? results.filteredVisits.length
              : 0
          }})
        </h2>
        <confusion-matrix :matrix="allCategoriesMatrix" />
      </b-row>
    </b-col>
  </b-container>
</template>
<script>
import api from "../api/index";
import ConfusionMatrix from "@/components/Metrics/ConfusionMatrix";
import MetricsSearchParams from "@/components/Metrics/MetricsSearchParams";
import { countByClassThenAiClass } from "@/helpers/aiStats";

export default {
  name: "AiMetricsView",
  components: {
    ConfusionMatrix,
    MetricsSearchParams,
  },
  props: {},
  data() {
    return {
      results: null,
      days: 7,
      start: null,
      pendingProgress: 0,
      queryPending: false,
      allCategoriesMatrix: null,
      labels: [
        "bird",
        "possum",
        "cat",
        "hedgehog",
        "rodent",
        "mustelid",
        "wallaby",
        "false-positive",
        "none",
        "unidentified",
        "un known",
        "none",
        "other",
      ],
    };
  },
  mounted() {
    //  this.getVisits();
  },
  methods: {
    querySubmitted(queryParams) {
      this.getVisits(queryParams);
    },
    async getVisits(queryParams) {
      // Remove previous values
      this.queryPending = true;
      this.pendingProgress = 0;
      this.allCategoriesMatrix = null;
      // Call API and process results
      this.results = await api.monitoring.getAllVisits(
        queryParams,
        aiComparisonVisit,
        this.updateProgress
      );
      this.queryPending = false;
      this.allCategoriesMatrix = countByClassThenAiClass(
        this.results.filteredVisits,
        this.labels,
        "other"
      );
    },
    updateProgress(progress) {
      this.pendingProgress = progress;
    },
  },
};
function aiComparisonVisit(visit) {
  return visit.classFromUserTag || false;
}
</script>

<style scoped lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

$main-content-width: 1000px;

.search-content-wrapper {
  margin: 0 auto;
  flex-basis: $main-content-width;
  h1 {
    margin: 2rem 0 1.2rem;
  }
  h2 {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
    color: $gray-700;
  }
}

.progress {
  width: 60%;
  height: 3em;
}

#heatmapcontainer:after {
  content: "";
  display: block;
  padding-bottom: 100%;
}

#matrix.disabled {
  opacity: 0;
}
</style>
