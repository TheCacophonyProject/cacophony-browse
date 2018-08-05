import api from '../../api/index';
import store from '../../stores';

const state =  {
  isLoggingIn: false,
  didInvalidate: false,
  JWT: localStorage.getItem('JWT'),
  userData: {'username': localStorage.getItem('username')},
  errorMessage: undefined
};


// getters https://vuex.vuejs.org/guide/getters.html

const getters = {
  isLoggedIn: state => !!state.JWT,
  getToken: state => state.JWT
};

// actions https://vuex.vuejs.org/guide/actions.html
//Actions are similar to mutations, the differences being that:
//
//	Instead of mutating the state, actions commit mutations.
//	Actions can contain arbitrary asynchronous operations.

const actions = {
  async LOGIN ({ commit,  }, payload) {
    commit('invalidateLogin');

    const result = await api.user.login(payload.username, payload.password);
    if(result.success) {
      api.user.persistUser(result.userData.username,result.token);
      commit('receiveLogin', result);
      return;
    }

    result.messages.forEach(message => {
      // TODO: Review - API returns either errors or messages when success flag is false. Errors are displayed at the fetch level, messages seems a special case and is handle here:
      store.dispatch('Messaging/ERROR', message);
    });

  },
  LOGOUT (context) {
    context.commit('invalidateLogin');
    api.user.logout();
  },
  async REGISTER ({ commit }, payload) {

    const result = await api.user.register(payload.username, payload.password);

    if(result.success) {
      api.user.persistUser(result.userData.username,result.token);
      commit('receiveLogin', result);
    }
  }
};

// mutations https://vuex.vuejs.org/guide/mutations.html
const mutations = {
  invalidateLogin (state) {
    state.JWT = "";
  },
  rejectLogin (state, data) {
    state.JWT = '';
    state.errorMessage = data.messages || data.message;
  },
  receiveLogin (state, data) {
    state.JWT = data.token;
    state.userData= data.userData;
  }
};

export default {
  namespaced: true, // If true access via this.$store.getters['User.isLoggedIn'] syntax
  state,
  getters,
  actions,
  mutations
};
