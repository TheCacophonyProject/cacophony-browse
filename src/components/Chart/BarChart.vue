<template>
  <div style="position: relative; height:100%; width:100%">
    <h2 v-if="message" class="message">{{ message }}</h2>
    <canvas :id="id" />
  </div>
</template>

<script>
import Chart from "chart.js";

export default {
  name: "BarChart",
  props: {
    title: {
      type: String,
      default: "Title"
    },
    xAxisLabel: {
      type: String,
      default: "x Axis Label"
    },
    yAxisLabel: {
      type: String,
      default: "y Axis Label"
    },
    data: {
      type: Object,
      required: true
    },
    log: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      id: "bar-chart",
      chart: null
    };
  },
  computed: {
    chartData: function() {
      return {
        type: "bar",
        data: this.data,
        options: {
          responsive: true,
          scales: {
            yAxes: [
              {
                type: this.log ? "logarithmic" : "linear",
                ticks: {
                  beginAtZero: true,
                  userCallback: tick => {
                    if (this.log) {
                      var remain =
                        tick /
                        Math.pow(10, Math.floor(Chart.helpers.log10(tick)));
                      if (remain === 1 || remain === 2 || remain === 5) {
                        return tick.toString();
                      }
                      return "";
                    } else {
                      return tick;
                    }
                  },
                  min: 0
                },
                scaleLabel: {
                  display: true,
                  labelString: this.yAxisLabel
                }
              }
            ],
            xAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: this.xAxisLabel
                }
              }
            ]
          },
          title: {
            text: this.title,
            display: true
          },
          legend: {
            display: false
          },
          maintainAspectRatio: false,
          onClick: (event, array) => {
            if (array.length > 0) {
              // Send click event if a bar is clicked on
              this.$emit("click", array);
            }
          },
          onHover: (event, array) => {
            if (array.length > 0) {
              // Change pointer when hovering over a bar
              event.target.style.cursor = "pointer";
            }
          }
        }
      };
    }
  },
  mounted() {
    const ctx = document.getElementById(this.id);
    this.chart = new Chart(ctx, this.chartData);
  }
};
</script>
<style scoped>
.message {
  position: absolute;
  height: 50%;
  width: 50%;
  padding-top: 12%;
  margin: 15% 25%;
  text-align: center;
  background: white;
  color: darkgrey;
}
</style>
