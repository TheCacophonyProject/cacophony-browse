import api from '../../api/index';

const state = {
  groups: [],
  currentGroup: null,
  fetched: false
};

const getters = {};

async function _getGroup(groupname, commit) {
  const {result} = await api.groups.getGroups(groupname);
  const group = result.groups[0];
  commit('setCurrentGroup', group);
  commit('receiveGroups', result.groups);
}

const actions = {
  async GET_GROUPS({commit}) {
    commit('fetching');
    const {result} = await api.groups.getGroups();
    commit('receiveGroups', result.groups);
    commit('fetched');
  },

  async GET_GROUP({commit, state}, groupname) {
    commit('fetching');
    await _getGroup(groupname, commit, state);
    commit('fetched');
  },

  async ADD_GROUP({commit, state}, groupname) {
    commit('fetching');
    const {success} = await api.groups.addNewGroup(groupname);
    if(!success) {
      commit('fetched');
      throw "There were errors";
    }
    await _getGroup(groupname, commit, state);
    commit('fetched');
  },

  async ADD_GROUP_USER({commit, state}, {groupName, userName, isAdmin}) {
    commit('fetching');
    await api.groups.addGroupUser(groupName, userName, isAdmin);
    await _getGroup(state.currentGroup.groupname, commit, state);
    commit('fetched');
  },

  async REMOVE_GROUP_USER({commit, state}, {groupName, userName}) {
    commit('fetching');
    await api.groups.removeGroupUser(groupName, userName);
    await _getGroup(state.currentGroup.groupname, commit, state);
    commit('fetched');
  }
};

const mutations = {
  receiveGroups(state, groups) {
    state.groups = groups;
  },
  setCurrentGroup(state, currentGroup) {
    state.currentGroup = currentGroup;
  },
  fetching(state) {
    state.fetched = false;
  },
  fetched(state) {
    state.fetched = true;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
