import api from '../../api';
import store from '../index';

const state = {
  downloadFileJWT: null,
  downloadRawJWT: null,
  recording: {
    Tags: []
  },
  tracks: []
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
        tagItem.who = tag.tagger ? tag.tagger.username : '-';
      }
      tagItem.when = new Date(tag.createdAt).toLocaleString();
      tagItem.tag = tag;
      tagItems.push(tagItem);
    });
    return tagItems;
  }
};

const getRecording = async function(commit, recordingId) {
  const recording = await api.recording.id(recordingId);
  commit('receiveRecording', recording);
  return recording.success;
};

const getTracks = async function(commit, recordingId) {
  const tracks = await api.recording.tracks(recordingId);
  commit('receiveTracks', tracks);
  return tracks.success;
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
    const recording = getRecording(commit, recordingId);
    const tracks = getTracks(commit, recordingId);

    await recording;
    await tracks;

    return recording && tracks;
  },

  async DELETE_TAG({commit}, tag) {
    await api.tag.deleteTag(tag);
    commit('deleteTag', tag);
  },

  async ADD_TAG(commit, {tag, id}) {
    await api.tag.addTag(tag, id);
    store.dispatch('Video/GET_RECORDING', id);
  },

  async ADD_TRACK_TAG({commit}, {tag, recordingId, trackId}) {
    await api.recording.addTrackTag(tag, recordingId, trackId);
    return await getTracks(commit, recordingId);
  },

  async DELETE_TRACK_TAG({commit}, {tag, recordingId}) {
    await api.recording.deleteTrackTag(tag, recordingId);
    return await getTracks(commit, recordingId);
  },
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
  },
  receiveTracks(state, {tracks}) {
    state.tracks = tracks;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
