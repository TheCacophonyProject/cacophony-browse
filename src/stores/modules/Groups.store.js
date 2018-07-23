import api from '../../api/index';

const state = {
  groups: [],
  valid: false,
  fetching: true
};

// getters https://vuex.vuejs.org/guide/getters.html

const getters = {};

// actions https://vuex.vuejs.org/guide/actions.html
//Actions are similar to mutations, the differences being that:
//
//	Instead of mutating the state, actions commit mutations.
//	Actions can contain arbitrary asynchronous operations.

const actions = {
  GET_GROUPS ({ commit, rootState }, groupName) {
    commit('fetching');
    return new Promise((resolve, reject) => {
      api.groups.getGroups(groupName, rootState.User.JWT)
        .then(response => response.json())
        .then(json => {
          if (!json.success) {
            return reject(json.message || json.messages);
          }
          commit('receiveGroups', json);
          resolve(json);
        });
    });

  },
  NEW_GROUP ({ commit, rootState }, {groupName}) {
    commit('fetching');
    return new Promise((resolve, reject) => {
      api.groups.newGroup(groupName, rootState.User.JWT)
        .then(response => response.json())
        .then(json => {
          if (!json.success) {
            return reject(json);
          }
          resolve(json);
        });
    });
  },
  ADD_GROUP_USER ({ commit, rootState }, {groupId, userName, isAdmin}) {
    commit('fetching');
    return new Promise((resolve, reject) => {
      api.groups.addGroupUser(groupId, userName, isAdmin, rootState.User.JWT)
        .then(response => response.json())
        .then(json => {
          if (!json.success) {
            return reject(json.message || json.messages);
          }
          resolve(json);
        });
    });
  },
  REMOVE_GROUP_USER ({ commit, rootState }, {groupId, userId}) {
    commit('fetching');
    return new Promise((resolve, reject) => {
      api.groups.removeGroupUser(groupId, userId, rootState.User.JWT)
        .then(response => response.json())
        .then(json => {
          if (!json.success) {
            return reject(json.message || json.messages);
          }
          resolve(json);
        });
    });
  }
};

// mutations https://vuex.vuejs.org/guide/mutations.html
const mutations = {
  receiveGroups (state, { groups }) {
    state.groups = groups;
    state.fetching = false;
  },
  fetching (state) {
    state.fetching = true;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
