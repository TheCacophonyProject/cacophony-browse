<template>
  <div :id="id" width="70%" class="confusion"/>
</template>

<script>
import { ClassificationCounter } from "@/helpers/aiStats";
import Highcharts from 'highcharts';  
// Load module after Highcharts is loaded
require('highcharts/modules/heatmap')(Highcharts);  

export default {
  name: "ConfusionMatrix",
  props: {
    matrix: {
      type: Object,
      default: {},
    },
    otherClass: {
      type: String,
      default: ""
    }, 
    id: {
      type: String,
      default: "confusion-matrix"
    },
  },
  data() {
    return {
      chart: null
    };
  },
  watch: {
    matrix: function() {
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      if (this.matrix.percentages) {
        this.makeAllCategoriesHeatmap();
      }
    }
  },
  computed: {
  },
  methods: {
    getCounter(point) {
      const key = ClassificationCounter.makeKey(point.y, point.x);
      return this.matrix.counters[key];
    },
    makeAllCategoriesHeatmap() {
      const otherClasses = (point) => JSON.stringify(this.getCounter(point).otherClasses);
      const recordingIds = (point) => this.getCounter(point).recIds;
      const actualNumber = (point) => this.getCounter(point).count;
      this.chart = Highcharts.chart(this.id, {

        chart: {
            type: 'heatmap',
            plotBorderWidth: 1,
            height: '500px'
        },


        title: {
            text: 'Confusion matrix'
        },

        xAxis: {
            categories: this.matrix.labels
        },

        yAxis: {
            categories: this.matrix.labels,
            reversed: true,
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
              const value =  actualNumber(this.point);
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
                      const ids = recordingIds(event.point);
                      let url = "";
                      if (ids.length > 0) {
                        url = `recording/${ids[0]}?id=${ids.join("&id=")}`;
                        window.open(url);
                      }
                  }
              }
          }
        },

      series: [{
          name: 'Visits per category',
          borderWidth: 1,
          data: this.matrix.percentages || {},
          dataLabels: {
              enabled: true,
              color: '#000000',
              format: '{point.value:.2f}'
          },
      }],
      });
    }
  },
};    
</script>

<style scoped>
.confusion:after {
  content: "";
  display: block;
  padding-bottom: 100%;
}
</style>
