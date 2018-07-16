import Vue from 'vue';
import App from './App.vue';
import store from './stores';
import { createRouter } from './router';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

const router = createRouter();

Vue.use(BootstrapVue);

// https://vue-multiselect.js.org
import Multiselect from 'vue-multiselect';
Vue.component('multiselect', Multiselect);

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
});
