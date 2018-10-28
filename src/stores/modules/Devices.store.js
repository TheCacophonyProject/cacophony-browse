import api from '../../api/index';

const state = {
  devices: [],
  currentDevice: null,
  fetched: false
};

const getters = {};

async function _getDevice(devicename, commit) {
  const result = await api.device.getDevices();
  const device = result.devices.rows.find(device => device.devicename === devicename);
  commit('setCurrentDevice', device);
}

const actions = {
  async GET_DEVICES({commit}) {
    commit('fetching');
    const result = await api.device.getDevices();
    commit('receiveDevices', result.devices.rows);
    commit('fetched');
  },

  async GET_DEVICE({commit}, devicename) {
    commit('fetching');
    await _getDevice(devicename, commit);
    commit('fetched');
  },

  async ADD_USER({commit}, {username, device, admin}) {
    commit('fetching');
    await api.device.addUserToDevice(username, device.id, admin);
    await _getDevice(device.devicename, commit);
    commit('fetched');
  },

  async REMOVE_USER({commit}, {userName, device}) {
    commit('fetching');
    await api.device.removeUserFromDevice(userName, device.id);
    await _getDevice(device.devicename, commit);
    commit('fetched');
  }
};

const mutations = {
  receiveDevices(state, devices) {
    state.devices = devices;
  },
  setCurrentDevice(state, device) {
    state.currentDevice = device;
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
