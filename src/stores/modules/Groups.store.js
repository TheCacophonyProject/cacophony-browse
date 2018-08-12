import api from '../../api/index';

const state = {
  groups: [],
  errors: null,
  fetching: true
};

// getters https://vuex.vuejs.org/guide/getters.html

const getters = {};

//  actions https://vuex.vuejs.org/guide/actions.html
//  Actions are similar to mutations, the differences being that:
//
//	Instead of mutating the state, actions commit mutations.
//	Actions can contain arbitrary asynchronous operations.

const actions = {
  async GET_GROUPS ({ commit, rootState }, groupName) {
    commit('fetching');
    const result = await api.groups.getGroups(groupName, rootState.User.JWT);
    commit('fetched');

    if(result.success) {
      commit('receiveGroups', result);
    }
  },

  async ADD_GROUP ({ commit, rootState }, {groupName}) {
    commit('fetching');
    const result = await api.groups.addNewGroup(groupName, rootState.User.JWT);
    commit('fetched');

    if(result.success) {
      commit('handleUpdate', result);
    }
  },

  async ADD_GROUP_USER ({ commit, rootState }, {groupId, userName, isAdmin}) {
    commit('fetching');
    const result = await api.groups.addGroupUser(groupId, userName, isAdmin, rootState.User.JWT);
    commit('fetched');

    if(result.success) {
      commit('handleUpdate', result);
    }
  },
  async REMOVE_GROUP_USER ({ commit, rootState }, {groupId, userId}) {
    commit('fetching');
    const result = await api.groups.removeGroupUser(groupId, userId, rootState.User.JWT);
    commit('fetched');

    if (result.success) {
      commit('handleUpdate', result);
    }
  }
};

// mutations https://vuex.vuejs.org/guide/mutations.html
const mutations = {
  receiveGroups (state, { groups }) {
    state.groups = groups;
  },
  handleUpdate (state, { messages }) {
    state.messages = messages;
  },
  handleErrors (state, { errors }) {
    state.errors = errors;
  },
  fetching (state) {
    state.fetching = true;
  },
  fetched (state) {
    state.fetching = false;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
