import Vue from 'vue';
import App from './App.vue';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import Vuelidate from 'vuelidate';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Multiselect from 'vue-multiselect';
import router from './router';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import store from './stores';

// https://bootstrap-vue.js.org/docs
Vue.use(BootstrapVue);

//https://monterail.github.io/vuelidate
Vue.use(Vuelidate);

// https://www.npmjs.com/package/@fortawesome/vue-fontawesome
library.add(faTrash);
Vue.component('font-awesome-icon', FontAwesomeIcon);

// https://vue-multiselect.js.org
Vue.component('multiselect', Multiselect);

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
});
