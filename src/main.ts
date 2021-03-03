import Vue from "vue";
import App from "./App.vue";
import BootstrapVue from "bootstrap-vue";
import "bootstrap/scss/bootstrap.scss";
import Vuelidate from "vuelidate";
import Multiselect from "vue-multiselect";
import router from "./router";
import FontAwesomeIcon from "./fontAwesomeIcons";
import store from "./stores";
import "./styles/global.scss";
import config from "./config";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
// Leaflet CSS
import "leaflet/dist/leaflet.css";
import Router from "vue-router";
import {User} from "@/api/Recording.api";

interface GlobalUserState {
  user: User | null;
  locallyPersistentUIPreferences: string[];
}

// We really don't need vuex for handling global state, we always fetch data at a view level, and the only thing
// we need globally is the user settings.
// See https://vuejs.org/v2/guide/state-management.html#Simple-State-Management-from-Scratch
export const LoggedInUserState: GlobalUserState = {
  user: null,
  locallyPersistentUIPreferences: [],
  // TODO(jon): This state could be hidden so there are only getters?
};

export default function () {
  // https://bootstrap-vue.js.org/docs
  Vue.use(BootstrapVue);

  //https://monterail.github.io/vuelidate
  Vue.use(Vuelidate);

  Vue.use(Router);

  Vue.component("font-awesome-icon", FontAwesomeIcon);

  // https://vue-multiselect.js.org
  Vue.component("multiselect", Multiselect);

  new Vue({
    el: "#app",
    data: LoggedInUserState,
    // @ts-ignore
    store,
    router,
    render: (h) => h(App),
  });

  if (config.environment !== "PRODUCTION") {
    console.info(`${config.environment} MODE\n\nConfig:\n`, config); // eslint-disable-line
  }
}
