const state = {
  messages: [],
};

const getters = {};

const actions = {
  WARN({ commit }, message) {
    commit("log", { message, level: "warning" });
  },
  ERROR({ commit }, message) {
    commit("log", { message, level: "danger" });
  },
  INFO({ commit }, message) {
    commit("log", { message, level: "info" });
  },
  SUCCESS({ commit }, message) {
    commit("log", { message, level: "success" });
  },
  ACKNOWLEDGE({ commit }) {
    commit("acknowledge");
  },
};

const mutations = {
  log(state, message) {
    state.messages = [...state.messages, message];
  },
  acknowledge(state) {
    state.messages = [];
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
