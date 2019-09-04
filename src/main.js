import Vue from "vue";
import App from "./App.vue";
import BootstrapVue from "bootstrap-vue";
import Vue2Filters from "vue2-filters";
import "bootstrap/scss/bootstrap.scss";
import Vuelidate from "vuelidate";
import Multiselect from "vue-multiselect";
import router from "./router";
import FontAwesomeIcon from "./fontAwesomeIcons";
import store from "./stores";
import "./styles/global.css";
import config from "./config";

export default function() {
  // https://bootstrap-vue.js.org/docs
  Vue.use(BootstrapVue);

  //https://monterail.github.io/vuelidate
  Vue.use(Vuelidate);

  //https://github.com/freearhey/vue2-filters
  Vue.use(Vue2Filters);

  Vue.component("font-awesome-icon", FontAwesomeIcon);

  // https://vue-multiselect.js.org
  Vue.component("multiselect", Multiselect);

  new Vue({
    el: "#app",
    store,
    router,
    render: h => h(App)
  });

  if (config.environment !== "PRODUCTION") {
    console.info(`${config.environment} MODE\n\nConfig:\n`, config); // eslint-disable-line
  }
}
