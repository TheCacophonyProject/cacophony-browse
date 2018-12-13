import api from '../../api';
import store from '../index';

const state = {
  downloadFileJWT: null,
  downloadRawJWT: null,
  recording: {
    Tags: []
  }
};

// getters https://vuex.vuejs.org/guide/getters.html

const getters = {
  getTagItems(state) {
    const tags = state.recording.Tags;
    const tagItems = [];
    tags.map((tag) => {
      const tagItem = {};
      if (tag.animal) {
        tagItem.animal = tag.animal;
      }

      tagItem.event = tag.event;
      if (tag.confidence) {
        tagItem.confidence = tag.confidence.toFixed(2);
      }
      if (tag.automatic) {
        tagItem.who = "Cacophony AI";
        tagItem['_rowVariant'] = 'warning';
      } else {
        tagItem.who = tag.tagger.username;
      }
      tagItem.when = new Date(tag.createdAt).toLocaleString();
      tagItem.tag = tag;
      tagItems.push(tagItem);
    });
    return tagItems;
  }
};

const actions = {

  async QUERY_RECORDING(undefined, {params, direction, skipMessage}) {
    const result = await api.recording.query(params);
    if (!result.rows || result.rows.length == 0) {
      if (!skipMessage) {
        store.dispatch('Messaging/WARN', `No ${direction} recording for this device.`);
      }
      return false;
    }
    return store.dispatch('Video/GET_RECORDING', result.rows[0].id);
  },

  async GET_RECORDING({commit}, recordingId) {
    const result = await api.recording.id(recordingId);
    commit('receiveRecording', result);
    return result.success;
  },

  async DELETE_TAG({commit}, tag) {
    await api.tag.deleteTag(tag);
    commit('deleteTag', tag);
  },

  async ADD_TAG(undefined, {tag, id}) {
    await api.tag.addTag(tag, id);
    store.dispatch('Video/GET_RECORDING', id);
  }
};

// mutations https://vuex.vuejs.org/guide/mutations.html
const mutations = {
  receiveRecording(state, {recording, downloadFileJWT, downloadRawJWT}) {
    state.recording = recording;
    state.downloadFileJWT = downloadFileJWT;
    state.downloadRawJWT = downloadRawJWT;
  },
  deleteTag(state, tagId) {
    state.recording.Tags = state.recording.Tags.filter(tag => tag.id != tagId);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
