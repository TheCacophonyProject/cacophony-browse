<template>
  <b-container fluid>
    <b-row>
      <div id="heatmapcontainer" style="height: 500px">
      </div>
        Is pending {{ queryPending }}
        matrix {{ JSON.stringify(matrix) }}
        <p></p>
        visits {{ JSON.stringify(results) }}

        <span v-if="!queryPending"> of visits {{results.totalVisits }}</span>
        <span v-if="!queryPending"> is all {{results.all }}</span>
    </b-row>
  </b-container>
</template>
<script>
import api from "../api/index";
import { countByClassThenAiClass } from "@/helpers/aiStats";
import Highcharts from 'highcharts';  
// Load module after Highcharts is loaded
require('highcharts/modules/heatmap')(Highcharts);  
// Create the chart

export default {
  name: "AiMetricsView",
  props: {},
  data() {
    return {
      queryPending: false,
      matrix: {},
      matrixDetails: {},
      results: {},
      labels: [
    "bird", 
    "possum", 
    "cat", 
    "hedgehog", 
    "rodent", 
    "mustelid",
    "wallaby", 
    "other",
    "none",
    "unidentified",
    "unknown", 
    "none"]
    };
  },
  mounted() {
    this.getVisits();
  },
  methods: {
    async getVisits() {
      // Remove previous values
      this.countMessage = "";
      this.results = {};
      // Call API and process results
      this.queryPending = true;
      const lastWeekQuery = {
        days:1, 
      };
      this.results = await api.monitoring.getAIVisitsForStats(lastWeekQuery);
      const countByClasses = countByClassThenAiClass(this.results.labelledVisits, this.labels, "other");
      this.matrix = countByClasses.heatMapPoints;
      this.matrixDetails = countByClasses.counters;
      this.queryPending = false;
      this.makeAllCategoriesHeatmap();
    },
    makeAllCategoriesHeatmap() {
      const otherClasses = (point) => JSON.stringify(this.matrixDetails[`${point.y}-${point.x}`].otherClasses);
      const recordingIds = (point) => this.matrixDetails[`${point.y}-${point.x}`].recIds;
      Highcharts.chart('heatmapcontainer', {

      chart: {
          type: 'heatmap',
          marginTop: 40,
          marginBottom: 80,
          plotBorderWidth: 1
      },


      title: {
          text: 'Confusion matrix'
      },

      xAxis: {
          categories: this.labels
      },

      yAxis: {
          categories: this.labels,
          reversed: true
      },

      colorAxis: {
          min: 0,
          minColor: '#FFFFFF',
          maxColor: Highcharts.getOptions().colors[0]
      },

      legend: {
          align: 'right',
          layout: 'vertical',
          margin: 0,
          verticalAlign: 'top',
          y: 25,
          symbolHeight: 280
      },

      tooltip: {
          formatter: function () {
            const value = this.point.value;
            const userClass = this.point.series.yAxis.categories[this.point.y];
            const aiClass = this.point.series.xAxis.categories[this.point.x];
            if (aiClass !== "other") {
              return `There were ${value} visits identified by users as ${userClass} and by the ai as ${aiClass}`;
            }
            else {
              const classes = otherClasses(this.point)
              return `There were ${value} visits identified by users as ${userClass} and by the ai as ${classes}`;
            }
          }
      },

      plotOptions: {
        series: {
            cursor: 'pointer',
            events: {
                click: function (event) {
                    // const userClass = event.point.series.yAxis.categories[event.point.y];
                    // const aiClass = event.point.series.xAxis.categories[event.point.x];
                    const ids = recordingIds(event.point);
                    let url = "";
                    if (ids.length > 0) {
                      url = `recording/${ids[0]}?id=${ids.join("&id=")}`;
                    }
                    location.href = url;
                    // alert(
                    //     this.name + ' clicked\n'+ ' point is (' + userClass + ',' + aiClass + ") whch is recordingIds" + recordingIds(event.point)
                    // );
                }
            }
        }
    },

      series: [{
          name: 'Visits per category',
          borderWidth: 1,
          data: this.matrix,
          dataLabels: {
              enabled: true,
              color: '#000000'
          }
      }],

      responsive: {
          rules: [{
              condition: {
                  maxWidth: 500
              },
              chartOptions: {
                  yAxis: {
                      labels: {
                          formatter: function () {
                              return this.value.charAt(0);
                          }
                      }
                  }
              }
          }]
      },

      details: this.matrixDetails

    });
    }
  },
};
</script>

<style scoped lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

$main-content-width: 640px;

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

  .search-results {
    max-width: $main-content-width;
    margin: 0 auto;
    padding: 0 1em;
  }

  &.display-rows {
    .search-results {
      margin: 0;
      width: 100%;
      max-width: calc(100vw - 2em);
    }

    .results {
      overflow: auto;
    }

    .results-rows {
      display: table-row-group;
    }
    .all-rows {
      display: table;
      width: 100%;
      border-top: 1px solid $border-color;
      border-left: 1px solid $border-color;
    }

    .results-header {
      margin-bottom: 0;
      display: table-header-group;
      > div {
        display: table-row;

        > span {
          position: sticky;
          top: 0;
          background: transparentize($white, 0.15);
          padding: 5px;
          font-weight: 700;
          vertical-align: middle;
          display: table-cell;
          border-right: 1px solid $border-color;
          border-bottom: 2px solid $border-color;
        }
      }
    }
  }
}

.recording-placeholder {
  height: 110px;
  margin-bottom: 15px;
}

.no-results {
  display: flex;
  flex-flow: column nowrap;
  margin-top: 20vh;
  text-align: center;
}

.sticky-footer {
  background: $white;
  border-top: 1px solid $gray-200;
  padding: 7px;
  .pagination-per-page {
    max-width: $main-content-width;
    margin: 0 auto;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    .results-per-page {
      width: auto;
      float: right;
    }
  }
  .pagination {
    margin-bottom: 0;
    justify-content: center;
  }
}

.search-filter-wrapper {
  background: $gray-100;
  position: relative;
  border-right: 1px solid $gray-200;
}

@include media-breakpoint-down(md) {
  .search-filter-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    transform: translate(0);
    width: var(--search-panel-width);
    z-index: 2;
    transition: transform 0.2s;
    &.is-collapsed {
      transform: translate(var(--search-panel-offset));
    }
  }
}

@include media-breakpoint-up(md) {
  .search-filter-wrapper {
    flex: 0 0 320px;
  }
  .search-content-wrapper {
    flex: 1 1 $main-content-width;
    position: relative;
    overflow: hidden;
    overflow-y: scroll;
    margin: 0;
    max-height: calc(100vh - var(--navbar-height));
  }
  .sticky-footer {
    position: sticky;
    bottom: 0;
  }
}
.display-toggle {
  margin-right: 5px;
}
</style>
