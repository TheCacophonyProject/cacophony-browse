import api from '../../api/index';
import store from '../../stores';

const state = {
  devices: {},
  currentDevice: {},
  errors: null,
  fetching: null
};

const getters = {
  isAdmin(state, device) {
    for (var i in device.Users) {
      if (device.Users[i].id === state.Users) {
        return device.Users[i].DeviceUsers.admin;
      }
    }
    return false;
  }
};

const actions = {
  async GET_DEVICES ({ commit }) {
    commit('fetching');

    const result = await api.device.getDevices();
    commit('fetched');

    if(result.success) {
      commit('receiveDevices', result);
    }
  },
  async GET_DEVICE ({ commit }, devicename) {
    if(!state.devices.rows) {
      await store.dispatch('Devices/GET_DEVICES');
    }
    if(state.currentDevice && state.currentDevice.devicename === devicename) {
      return commit('setCurrentDevice', {});
    }
    const device = state.devices.rows.find(device => device.devicename === devicename);
    commit('setCurrentDevice', device);
  },
  async ADD_USER ({ commit }, {username, deviceId, admin}) {
    commit('fetching');

    const result = await api.device.addUserToDevice(username, deviceId, admin);
    commit('fetched');

    if(result.success) {
      await store.dispatch('Devices/GET_DEVICES');

      // FIXME: Vue component should re-render without needing the following two lines:
      const device = state.devices.rows.find(device => device.id === deviceId);
      commit('setCurrentDevice', device);
    }

  },
  async REMOVE_USER ({ commit }, { userId, deviceid }) {
    commit('fetching');

    const result = await api.device.removeUserFromDevice(userId, deviceid);
    commit('fetched');

    if(result.success) {
      await store.dispatch('Devices/GET_DEVICES');

      // FIXME: Vue component should re-render without needing the following two lines:
      const device = state.devices.rows.find(device => device.id === deviceid);
      commit('setCurrentDevice', device);
    }
  }
};

const mutations = {
  receiveDevices (state, { devices }) {
    state.devices = devices;
  },
  setCurrentDevice (state, device) {
    state.currentDevice = device;
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
