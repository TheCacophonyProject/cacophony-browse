import Vue from 'vue';
import Vuex from 'vuex';
import User from './modules/User.store.js';
//import actions from './actions' TODO: Clean up imports
//import mutations from './mutations'
//import getters from './getters'

Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    count: 5
  },
  mutations: {
    increment (state) {
      state.count++;
    }
  },
  modules: {
    User
  }
});
export default store;
