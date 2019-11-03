/* eslint-disable no-console */
import api from "../../api";
import store from "../index";

const state = {
  downloadFileJWT: null,
  downloadRawJWT: null,
  recording: {
    Tags: []
  },
  tracks: [],

  findTrack(trackId) {
    for (const track of this.tracks) {
      if (track.id == trackId) {
        return track;
      }
    }
    return null;
  }
};

// getters https://vuex.vuejs.org/guide/getters.html

const getters = {
  getTagItems(state) {
    const tags = state.recording.Tags;
    const tagItems = [];
    tags.map(tag => {
      const tagItem = {};
      if (tag.what) {
        tagItem.what = tag.what;
        tagItem.animal = tag.what;
      }
      tagItem.detail = tag.detail;
      tagItem.event = tag.detail;
      if (tag.confidence) {
        tagItem.confidence = tag.confidence.toFixed(2);
      }
      if (tag.automatic) {
        tagItem.who = "Cacophony AI";
        tagItem["_rowVariant"] = "warning";
      } else {
        tagItem.who = tag.tagger ? tag.tagger.username : "-";
      }
      tagItem.when = new Date(tag.createdAt).toLocaleString();
      tagItem.tag = tag;
      tagItems.push(tagItem);
    });
    return tagItems;
  },
  getAudioTagItems(state) {
    const tags = state.recording.Tags;
    const tagItems = [];
    tags.map(tag => {
      const tagItem = {};
      if (tag.event == "AUDIO") {
        // check for optional fields
        if (tag.tagId) {
          tagItem.id = tag.id;
        }
        if (tag.recordingId) {
          tagItem.recordingId = tag.recordingId;
        }
        // compulsory fields
        tagItem.tagValue = tag.tagValue;
        tagItem.startTime = tag.startTime;
        tagItem.duration = tag.duration;
        tagItem.confidence = tag.confidence;
        tagItem.automatic = tag.automatic;
        tagItem.schemaVersion = tag.schemaVersion;
        tagItem.when = new Date(tag.createdAt).toLocaleString();
        tagItem.who = tag.tagger;
      }
    });
    return tagItems;
  }
};

const actions = {
  async QUERY_RECORDING(_, { params, direction, skipMessage }) {
    const { result, success } = await api.recording.query(params);
    if (!success || !result.rows || result.rows.length == 0) {
      if (!skipMessage) {
        store.dispatch(
          "Messaging/WARN",
          `No ${direction} recording for this device.`
        );
      }
      return false;
    }
    return store.dispatch("Video/GET_RECORDING", result.rows[0].id);
  },

  async GET_RECORDING({ commit }, recordingId) {
    const recording = getRecording(commit, recordingId);
    const tracks = getTracks(commit, recordingId);

    await recording;
    await tracks;

    return {
      recording,
      tracks: tracks.tracks
    };
  },

  async DELETE_TAG({ commit }, tag) {
    const { success } = await api.tag.deleteTag(tag);
    if (success) {
      commit("deleteTag", tag);
    }
  },

  async UPDATE_COMMENT({ commit }, { comment, recordingId }) {
    const { success } = await api.recording.comment(comment, recordingId);
    if (success) {
      commit("updateComment", comment);
    }
  },

  async ADD_TAG({ commit }, { tag, id }) {
    const { success, result } = await api.tag.addTag(tag, id);
    if (!success) {
      return;
    }

    // Add an initial tag to update the UI more quickly.
    const newTag = Object.assign({}, tag);
    newTag.id = result.tagId;
    newTag.createdAt = new Date();
    commit("addTag", newTag);

    // Resync all recording tags from the API.
    const { success: syncSuccess, result: syncResult } = await api.recording.id(
      id
    );
    if (syncSuccess) {
      commit("setTags", syncResult.recording.Tags);
    }
  },

  async ADD_TRACK_TAG({ commit }, { tag, recordingId, trackId }) {
    const { success, result } = await api.recording.addTrackTag(
      tag,
      recordingId,
      trackId
    );
    if (!success) {
      return;
    }

    // Add an initial tag to update the UI more quickly.
    const newTag = Object.assign({}, tag);
    newTag.id = result.trackTagId;
    newTag.TrackId = trackId;
    newTag.createdAt = new Date();
    commit("addTrackTag", newTag);

    // Resync all tags for the track from the API.
    const {
      success: syncSuccess,
      result: syncResult
    } = await api.recording.tracks(recordingId);
    if (!syncSuccess) {
      return;
    }
    for (const track of syncResult.tracks) {
      if (track.id == trackId) {
        commit("setTrackTags", track);
      }
    }
    return result;
  },

  async DELETE_TRACK_TAG({ commit }, { tag, recordingId }) {
    const result = await api.recording.deleteTrackTag(tag, recordingId);
    if (!result.success) {
      return result;
    }
    commit("deleteTrackTag", tag);
    return result;
  }
};

// mutations https://vuex.vuejs.org/guide/mutations.html
const mutations = {
  receiveRecording(state, { recording, downloadFileJWT, downloadRawJWT }) {
    state.recording = recording;
    state.downloadFileJWT = downloadFileJWT;
    state.downloadRawJWT = downloadRawJWT;
  },

  receiveTracks(state, { tracks }) {
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].trackIndex = i;
    }
    state.tracks = tracks;
  },

  updateComment(state, comment) {
    state.recording.comment = comment;
  },

  addTag(state, tag) {
    state.recording.Tags.unshift(tag);
  },

  setTags(state, tags) {
    state.recording.Tags = tags;
  },

  deleteTag(state, tagId) {
    state.recording.Tags = state.recording.Tags.filter(tag => tag.id != tagId);
  },

  addTrackTag(state, tag) {
    const track = state.findTrack(tag.TrackId);
    track.TrackTags.push(tag);
  },

  setTrackTags(state, newTrack) {
    const track = state.findTrack(newTrack.id);
    if (track) {
      track.TrackTags = newTrack.TrackTags;
    }
  },

  deleteTrackTag(state, deletedTag) {
    const track = state.findTrack(deletedTag.TrackId);
    track.TrackTags = track.TrackTags.filter(tag => tag.id != deletedTag.id);
  }
};

const getRecording = async function(commit, recordingId) {
  const { result: recording } = await api.recording.id(recordingId);
  commit("receiveRecording", recording);
  return recording.success;
};

const getTracks = async function(commit, recordingId) {
  const { result: tracks } = await api.recording.tracks(recordingId);
  commit("receiveTracks", tracks);
  return tracks.success;
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
