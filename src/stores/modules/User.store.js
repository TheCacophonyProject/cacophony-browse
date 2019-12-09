import api from "../../api";

const state = {
  isLoggingIn: false,
  didInvalidate: false,
  JWT: localStorage.getItem("JWT"),
  userData: {
    id: Number(localStorage.getItem("userId")),
    username: localStorage.getItem("username"),
    email: localStorage.getItem("email"),
    globalPermission: getGlobalPermission(),
    acceptedEUA: localStorage.getItem("acceptedEUA")
  },
  latestEUA: localStorage.getItem("latestEUA"),
  euaUpdatedAt: localStorage.getItem("euaUpdatedAt"),
  errorMessage: undefined,
  recordingTypePref: localStorage.getItem("recordingTypePref") || "both",
  analysisDatePref: parseInt(localStorage.getItem("analysisDatePref")) || 7
};

function getGlobalPermission() {
  var globalPermission = localStorage.getItem("globalPermission");
  if (["write", "read", "off"].includes(globalPermission)) {
    return globalPermission;
  }
  return "off";
}

// getters https://vuex.vuejs.org/guide/getters.html

const getters = {
  isLoggedIn: state => !!state.JWT,
  getToken: state => state.JWT,
  hasEmail: state => !!state.userData.email && state.userData.email != "null",
  acceptedEUA: state => state.userData.acceptedEUA >= state.latestEUA,
  euaUpdatedAt: state => state.euaUpdatedAt
};

// actions https://vuex.vuejs.org/guide/actions.html
//Actions are similar to mutations, the differences being that:
//
//	Instead of mutating the state, actions commit mutations.
//	Actions can contain arbitrary asynchronous operations.

const actions = {
  async LOGIN({ commit }, payload) {
    commit("invalidateLogin");

    const { result, success } = await api.user.login(
      payload.username,
      payload.password
    );
    if (success) {
      api.user.persistUser(
        result.userData.username,
        result.token,
        result.userData.email,
        result.userData.globalPermission,
        result.userData.id,
        result.userData.endUserAgreement
      );
      commit("receiveLogin", result);
    }
  },
  LOGOUT(context) {
    context.commit("invalidateLogin");
    api.user.logout();
  },
  async REGISTER({ commit, state }, payload) {
    const { result, success } = await api.user.register(
      payload.username,
      payload.password,
      payload.email,
      state.latestEUA
    );
    if (success) {
      api.user.persistUser(
        result.userData.username,
        result.token,
        result.userData.email,
        result.userData.globalPermission,
        result.userData.id,
        result.userData.endUserAgreement
      );
      result.userData.acceptedEUA = result.userData.endUserAgreement;
      commit("receiveLogin", result);
    }
  },
  async UPDATE({ commit }, payload) {
    const { result, success } = await api.user.updateFields(payload);
    if (success) {
      api.user.persistFields(payload);
      commit("updateFields", payload);
      return true;
    } else {
      commit("rejectUpdate", result);
      return false;
    }
  },
  async ACCEPT_END_USER_AGREEMENT({ commit, state }) {
    const { result, success } = await api.user.updateFields({
      endUserAgreement: state.latestEUA
    });
    if (success) {
      const updateFields = { acceptedEUA: state.latestEUA };
      api.user.persistFields(updateFields);
      commit("updateFields", updateFields);
      return true;
    } else {
      commit("rejectUpdate", result);
      return false;
    }
  },
  async GET_END_USER_AGREEMENT_VERSION({ commit }) {
    const { result, success } = await api.user.getEUAVersion();
    if (success) {
      api.user.persistFields({ latestEUA: result.euaVersion });
      commit("updateLatestEUA", result.euaVersion);
      return true;
    } else {
      commit("rejectUpdate", result);
      return false;
    }
  }
};

// mutations https://vuex.vuejs.org/guide/mutations.html
const mutations = {
  invalidateLogin(state) {
    state.JWT = "";
  },
  rejectLogin(state, data) {
    state.JWT = "";
    state.errorMessage = data.messages || data.message;
  },
  receiveLogin(state, data) {
    state.JWT = data.token;
    state.userData = data.userData;
    state.userData.acceptedEUA = data.userData.endUserAgreement;
  },
  updateFields(state, data) {
    for (var key in data) {
      state.userData[key] = data[key];
    }
  },
  updateLatestEUA(state, latestEUA) {
    const now = new Date();
    state.euaUpdatedAt = now.toISOString();
    localStorage.setItem("euaUpdatedAt", now.toISOString());
    state.latestEUA = latestEUA;
    localStorage.setItem("latestEUA", latestEUA);
  },
  rejectUpdate(state, response) {
    state.errorMessage = response.message;
  },
  updateRecordingTypePref(state, data) {
    state.recordingTypePref = data;
    localStorage.setItem("recordingTypePref", data);
  },
  updateAnalysisDatePref(state, data) {
    state.analysisDatePref = data;
    localStorage.setItem("analysisDatePref", data);
  }
};

export default {
  namespaced: true, // If true access via this.$store.getters['User.isLoggedIn'] syntax
  state,
  getters,
  actions,
  mutations
};
