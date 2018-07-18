import Vue from 'vue';
import App from './App.vue';

// Vuex
// https://vuex.vuejs.org/
import store from './stores';

// Bootstrap-vue
// https://bootstrap-vue.js.org/docs
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
Vue.use(BootstrapVue);

// Font-awesome
// https://www.npmjs.com/package/@fortawesome/vue-fontawesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// Add more icons below
import { faTrash } from '@fortawesome/free-solid-svg-icons';
library.add(faTrash);
Vue.component('font-awesome-icon', FontAwesomeIcon);

// Multi-select
// https://vue-multiselect.js.org
import Multiselect from 'vue-multiselect';
Vue.component('multiselect', Multiselect);

// https://router.vuejs.org/
import { createRouter } from './router';
const router = createRouter();

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
});
