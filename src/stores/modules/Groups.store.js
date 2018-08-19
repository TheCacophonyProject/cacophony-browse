import api from '../../api/index';

const state = {
  groups: [],
  messages: [],
  errors: null,
  fetching: null
};

// getters https://vuex.vuejs.org/guide/getters.html

const getters = {};

//  actions https://vuex.vuejs.org/guide/actions.html
//  Actions are similar to mutations, the differences being that:
//
//	Instead of mutating the state, actions commit mutations.
//	Actions can contain arbitrary asynchronous operations.

const actions = {
  async GET_GROUPS ({ commit }, groupName) {
    commit('fetching');
    const result = await api.groups.getGroups(groupName);
    commit('fetched');

    if(result.success) {
      commit('receiveGroups', result);
    }
  },

  async ADD_GROUP ({ commit }, groupName) {
    commit('fetching');
    const result = await api.groups.addNewGroup(groupName);
    commit('fetched');

    if(result.success) {
      commit('receiveUpdate', result);
    }
  },

  async ADD_GROUP_USER ({ commit }, {groupId, userName, isAdmin}) {
    commit('fetching');
    const result = await api.groups.addGroupUser(groupId, userName, isAdmin);
    commit('fetched');

    if(result.success) {
      commit('receiveUpdate', result);
    }
  },
  async REMOVE_GROUP_USER ({ commit }, {groupId, userId}) {
    commit('fetching');
    const result = await api.groups.removeGroupUser(groupId, userId);
    commit('fetched');

    if (result.success) {
      commit('receiveUpdate', result);
    }
  }
};

// mutations https://vuex.vuejs.org/guide/mutations.html
const mutations = {
  receiveGroups (state, { groups }) {
    state.groups = groups;
  },
  receiveUpdate (state, { messages }) {
    state.messages = messages;
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
