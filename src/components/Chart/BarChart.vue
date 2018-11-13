<template>
  <div style="position: relative; height:100%; width:100%">
    <canvas :id="id" />
  </div>
</template>

<script>

import Chart from 'chart.js';

export default {
  name: "BarChart",
  props: {
    title: {
      type: String,
      default: "Title"
    },
    xAxisLabel: {
      type: String,
      default: 'x Axis Label'
    },
    yAxisLabel: {
      type: String,
      default: 'y Axis Label'
    },
    data: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      id: 'bar-chart',
      chart: null
    };
  },
  computed: {
    chartData: function () {
      return {
        type: 'bar',
        data: this.data,
        options: {
          responsive: true,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
              },
              scaleLabel: {
                display: true,
                labelString: this.yAxisLabel
              }
            }],
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: this.xAxisLabel
              }
            }]
          },
          title: {
            text: this.title,
            display: true
          },
          legend: {
            display: false
          },
          maintainAspectRatio: false
        }
      };
    }
  },
  mounted() {
    const ctx = document.getElementById(this.id);
    this.chart = new Chart(ctx, this.chartData);
  },
};
</script>

<style scoped>

</style>
