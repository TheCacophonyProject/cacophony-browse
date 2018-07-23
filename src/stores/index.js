import Vue from 'vue';
import Vuex from 'vuex';
import User from './modules/User.store';
import Groups from './modules/Groups.store';


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
    User,
    Groups
  }
});
export default store;
