<template>
  <div
    class="tagging-view"
    v-if="
      currentUser.globalPermission == 'read' ||
        currentUser.globalPermission == 'write'
    "
  >
    <AddCustomTrackTag
      @addTag="addCustomTag"
      :allow-comment="false"
      :allow-confidence="false"
    />
    <div class="player-and-controls">
      <div class="video-container">
        <div class="player">
          <transition name="fade">
            <div
              class="next-track-countdown"
              v-if="nextTrackOrRecordingTimeout !== 0"
            >
              <div>
                Next track in
              </div>
              <div class="countdown">{{ nextTrackOrRecordingTimeout }}</div>
            </div>
          </transition>
          <ThermalVideoPlayer
            v-if="fileSource || loading"
            ref="thermalPlayer"
            :video-url="fileSource || ''"
            :tracks="orderedTracks"
            :current-track="currentTrackIndex"
            :can-select-tracks="false"
            :loop-selected-track="true"
            :show-motion-paths="showMotionPaths"
            :show-overlays-for-current-track-only="true"
            @request-next-recording="nextRecording"
            @ready-to-play="playerIsReady"
          />
        </div>
      </div>
      <div class="controls">
        <div class="tag-buttons">
          <b-button
            :disabled="
              !readyToTag || (currentTrackIsAlreadyTagged && !isTagged(value))
            "
            :class="{ selected: isTagged(value) }"
            :key="text"
            v-for="{ text, value } in tags"
            @click="() => addTag(value)"
          >
            <img
              :alt="text"
              :title="`Mark as ${text}`"
              :src="`/${value}.png`"
            />
            <span>{{ text }}</span>
          </b-button>

          <b-button
            :disabled="!readyToTag || currentTrackIsAlreadyTagged"
            v-b-modal="'custom-track-tag'"
            class="btn btn-light btn-tag equal-flex"
          >
            <img
              alt="Other tag"
              title="Open form to add other tag"
              src="../assets/video/plus.png"
            />
            <span>other...</span>
          </b-button>

          <b-button :disabled="!readyToTag" @click="markTrackAsSkipped">
            <span>Skip track</span>
          </b-button>
        </div>
      </div>
    </div>
    <div class="actions">
      <b-button :disabled="!readyToTag || history.length === 0" @click="undo">
        Undo last action
      </b-button>
      <b-button @click="showMotionPaths = !showMotionPaths">
        {{ showMotionPaths ? "Hide" : "Show" }} motion paths
      </b-button>
    </div>
    <div>
      <h4 v-if="readyToTag">
        Tagging: Track {{ currentTrackIndex + 1 }},
        <a :href="`/recording/${currentRecording.id}`">
          Recording #{{ currentRecording.id }}
        </a>
      </h4>
      <h4 v-else>Loading recording</h4>
      <span>Tagged {{ numTagged }}</span
      >,
      <span>Skipped {{ numSkipped }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import config from "../config";
import ThermalVideoPlayer from "../components/Video/ThermalVideoPlayer.vue";
import AddCustomTrackTag from "../components/Video/AddCustomTrackTag.vue";
import api from "../api";
import DefaultLabels, { TagColours } from "../const";
import Vue from "vue";

import {
  DeviceId,
  Recording,
  RecordingInfo,
  RecordingType,
  TagMode,
  Track,
  TrackTag,
  User
} from "../api/Recording.api";

interface TaggingViewData {
  colours: string[];
  tags: { text: string; value: string }[];
  recordingsByDevice: Record<DeviceId, RecordingInfo>;
  currentDeviceId: DeviceId;
  currentTrackIndex: number;
  currentRecording: RecordingInfo | null;
  currentRecordingData: Recording | null;
  loading: boolean;
  taggingPending: boolean;
  readyToPlay: boolean;
  showMotionPaths: boolean;
  tracks: Track[];
  history: {
    tracks: Track[];
    trackIndex: number;
    recording: RecordingInfo;
    recordingData: Recording;
    tag: TrackTag;
  }[];
  nextTrackOrRecordingTimeout: number;
  currentTimeout: number | null;
}

export default Vue.extend({
  name: "TaggingView",
  components: { ThermalVideoPlayer, AddCustomTrackTag },
  data(): TaggingViewData {
    return {
      colours: TagColours,
      tags: [
        ...DefaultLabels.quickTagLabels().map(x => ({ text: x, value: x })),
        { text: "mustelid", value: "mustelid" },
        ...DefaultLabels.otherTagLabels()
      ],
      recordingsByDevice: {},
      tracks: [],
      history: [],
      currentRecording: null,
      currentDeviceId: -1,
      currentTrackIndex: 0,
      currentRecordingData: null,

      loading: true,
      taggingPending: false,
      readyToPlay: false,
      nextTrackOrRecordingTimeout: 0,
      showMotionPaths: false,
      currentTimeout: null
    };
  },
  methods: {
    async undo() {
      const {
        recording,
        recordingData,
        tracks,
        trackIndex,
        tag
      } = this.history.pop();

      await this.deleteTag(tag, recordingData.recording, tracks[trackIndex]);

      this.currentRecording = recording;
      this.currentRecordingData = recordingData;
      this.tracks = tracks;
      this.currentTrackIndex = trackIndex;
    },
    playerIsReady() {
      this.readyToPlay = true;
    },
    isTagged(tagValue: string): boolean {
      if (this.currentRecording && this.tracks && this.currentTrack) {
        for (const tag of this.currentTrack.TrackTags) {
          if (tag.User !== null && tag.what === tagValue) {
            return true;
          }
        }
      }
      return false;
    },
    markTrackAsSkipped() {
      const synthesisedTag = {
        id: -1,
        TrackId: this.currentTrack.id,
        what: "skipped",
        createdAt: new Date().toUTCString(),
        User: { username: this.currentUser.username, id: this.currentUser.id }
      };
      this.currentTrack.TrackTags.push(synthesisedTag);

      this.history.push({
        trackIndex: this.currentTrackIndex,
        tracks: this.orderedTracks,
        recording: this.currentRecording,
        recordingData: this.currentRecordingData,
        tag: synthesisedTag
      });
      this.primeNextTrack(3);
    },
    nextTrackOrRecording() {
      if (this.allTracksInRecordingAreTaggedByHuman) {
        this.nextRecording();
      } else {
        // Advance to next untagged track
        let nextIndex = this.currentTrackIndex;
        while (
          nextIndex < this.tracks.length &&
          this.trackIsAlreadyTaggedByHuman(this.orderedTracks[nextIndex])
        ) {
          nextIndex++;
        }
        this.currentTrackIndex = nextIndex;
      }
    },
    async nextRecording() {
      this.currentRecording = null;
      this.tracks = null;
      this.readyToPlay = false;
      this.loading = true;
      await this.pickRecording();
      this.loading = false;
    },
    addCustomTag({ what }) {
      this.addTag(what);
    },
    async addTag(tagLabel: string) {
      const recordingId = this.currentRecording.id;
      const trackId = this.orderedTracks[this.currentTrackIndex].id;
      const tag = { what: tagLabel, confidence: 0.85 };
      this.taggingPending = true;
      const { result } = await api.recording.addTrackTag(
        tag,
        recordingId,
        trackId
      );
      this.taggingPending = false;
      if (result.success) {
        // Add the track tag to this.data.tracks:
        const targetTrack: Track | undefined = this.tracks.find(
          track => track.id === trackId
        );
        if (targetTrack) {
          const synthesisedTag = {
            ...tag,
            User: {
              ...this.currentUser
            },
            id: result.trackTagId,
            TrackId: trackId,
            createdAt: new Date().toUTCString()
          };
          targetTrack.TrackTags.push(synthesisedTag);

          this.history.push({
            trackIndex: this.currentTrackIndex,
            tracks: this.orderedTracks,
            recording: this.currentRecording,
            recordingData: this.currentRecordingData,
            tag: synthesisedTag
          });
        }
        this.primeNextTrack(3);
      }
    },
    async deleteTag(tag: TrackTag, recording: RecordingInfo, track: Track) {
      if (tag.what !== "skipped") {
        const tagClone = { ...tag };
        if (!tag.hasOwnProperty("TrackId")) {
          tagClone.TrackId = track.id;
        }
        this.taggingPending = true;
        const { success } = await api.recording.deleteTrackTag(
          tagClone,
          recording.id
        );
        this.taggingPending = false;
        if (success) {
          // eslint-disable-next-line require-atomic-updates
          track.TrackTags = track.TrackTags.filter(item => item !== tag);
        }
      } else {
        // Just remove synthetic 'skipped' tag
        track.TrackTags = track.TrackTags.filter(item => item !== tag);
      }
    },
    primeNextTrack(tillNext: number) {
      this.nextTrackOrRecordingTimeout = tillNext;
      if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
      }
      this.currentTimeout = setTimeout(() => {
        if (tillNext !== 0) {
          this.primeNextTrack(tillNext - 1);
        } else {
          clearTimeout(this.currentTimeout);
          this.nextTrackOrRecording();
        }
      }, 300);
    },
    pickDevice() {
      const devices = Object.keys(this.recordingsByDevice).map(Number);
      // NOTE(jon): Just pick the first device, we'll rely on the backend to choose these for us.
      this.currentDeviceId = devices[0];
    },
    pickRecording: async function() {
      const recordings = this.recordingsByDevice[this.currentDeviceId];
      if (recordings && recordings.length !== 0) {
        // NOTE(jon): Just take the first recording, we'll rely on the backend to choose these for us.
        this.currentRecording = recordings.splice(0, 1)[0];

        // If we took the last recording for a device, remove the device,
        // and pick a next device.
        if (recordings.length === 0) {
          Vue.delete(this.recordingsByDevice, this.currentDeviceId);
          this.pickDevice();
        }

        const {
          tracks,
          recording
        }: {
          tracks: Track[];
          recording: Recording;
        } = await this.$store.dispatch(
          "Video/GET_RECORDING",
          this.currentRecording.id
        );
        if (!tracks || tracks.length === 0) {
          this.pickRecording();
        } else {
          this.tracks = tracks;
          this.currentRecordingData = recording;
          // Get the first track without human tags
          this.currentTrackIndex = this.orderedTracks.findIndex(
            track => !this.trackIsAlreadyTaggedByHuman(track)
          );
        }
      } else {
        this.pickDevice();
        this.pickRecording();
      }
    },
    async removeAllMyTags() {
      // NOTE(jon): This exists only for debugging purposes,
      //  so I can easily delete all my tags I've added during testing.
      const query = {
        where: {
          duration: { $gte: 0 },
          type: "thermalRaw" as RecordingType
        },
        limit: 100000,
        offset: 0,
        tagMode: "tagged" as TagMode
      };
      const stringifiedQuery = {};
      for (const [key, val] of Object.entries(query)) {
        if (typeof val === "object") {
          stringifiedQuery[key] = JSON.stringify(val);
        } else {
          stringifiedQuery[key] = val;
        }
      }

      const { result } = await api.recording.query(stringifiedQuery);
      const thisUserId = this.currentUser.id;
      const rows = result.rows.filter((recording: RecordingInfo) => {
        return recording.Tracks.find((track: Track) => {
          return track.TrackTags.find(
            (tag: TrackTag) => tag.UserId && tag.UserId === thisUserId
          );
        });
      });
      const allTagPromises = [];
      for (const recording of rows) {
        for (const track of recording.Tracks) {
          const tags = track.TrackTags.filter(
            trackTag => trackTag.UserId === this.currentUser.id
          );
          for (const tag of tags) {
            allTagPromises.push(this.deleteTag(tag, recording, track));
          }
        }
      }
      for (const p of allTagPromises) {
        await p;
      }
      if (allTagPromises.length) {
        // eslint-disable-next-line no-console
        console.log("deleted all tags for", this.currentUser.username);
      }
    },
    async getRecordings(): Promise<boolean> {
      const query = {
        where: {
          duration: { $gte: 0 },
          type: "thermalRaw" as RecordingType
        },
        limit: 1000,
        offset: 0,
        tagMode: "no-human" as TagMode
      };
      const stringifiedQuery = {};
      for (const [key, val] of Object.entries(query)) {
        if (typeof val === "object") {
          stringifiedQuery[key] = JSON.stringify(val);
        } else {
          stringifiedQuery[key] = val;
        }
      }
      const { result, success } = await api.recording.query(stringifiedQuery);
      if (success) {
        // Sort by device:
        for (const row of result.rows) {
          this.recordingsByDevice[row.DeviceId] =
            this.recordingsByDevice[row.DeviceId] || [];
          this.recordingsByDevice[row.DeviceId].push(row);
        }
      }
      return success;
    },
    trackIsAlreadyTaggedByHuman(track: Track): boolean {
      return (
        track.TrackTags.filter(
          (tag: TrackTag) => tag.User !== null && tag.User !== undefined
        ).length !== 0
      );
    }
  },
  computed: {
    numTagged(): number {
      return this.history.filter(({ tag }) => tag.what !== "skipped").length;
    },
    numSkipped(): number {
      return this.history.filter(({ tag }) => tag.what === "skipped").length;
    },
    allTracksInRecordingAreTaggedByHuman(): boolean {
      return (
        this.tracks.reduce((acc: Track[], track: Track) => {
          if (
            track.TrackTags.filter(
              (tag: TrackTag) => tag.User !== null && tag.User !== undefined
            ).length !== 0
          ) {
            acc.push(track);
          }
          return acc;
        }, []).length === this.tracks.length
      );
    },
    currentTrackIsAlreadyTagged(): boolean {
      return (
        this.currentTrack && this.trackIsAlreadyTaggedByHuman(this.currentTrack)
      );
    },
    readyToTag(): boolean {
      return (
        !this.taggingPending &&
        this.currentRecording &&
        this.currentTrack &&
        !this.loading &&
        this.readyToPlay &&
        this.nextTrackOrRecordingTimeout === 0
      );
    },
    currentTrack(): Track | undefined {
      if (this.tracks && this.currentTrackIndex < this.tracks.length) {
        return this.orderedTracks[this.currentTrackIndex];
      }
      // NOTE: This is technically an error, but we don't really want to return undefined from this
      return (this.orderedTracks && this.orderedTracks![0]) || undefined;
    },
    orderedTracks(): Track[] {
      return (
        (this.tracks &&
          [...this.tracks].sort((a, b) => a.data.start_s - b.data.start_s)) ||
        []
      );
    },
    currentUser(): User {
      return this.$store.state.User.userData;
    },
    fileSource(): string | false {
      if (this.currentRecordingData) {
        return `${config.api}/api/v1/signedUrl?jwt=${this.currentRecordingData.downloadFileJWT}`;
      }
      return false;
    }
  },
  async created() {
    const gotRecordings = await this.getRecordings();
    if (gotRecordings) {
      // this.removeAllMyTags();
      // Pick a random device to begin with:
      this.pickDevice();
      this.nextRecording();
    }
  }
});
</script>

<style scoped lang="scss">
.tagging-view {
  display: flex;
  flex-direction: column;
  align-self: center;
}
.player-and-controls {
  display: flex;
  flex-direction: row;
  margin-top: 10px;
}
.tag-buttons {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-items: stretch;
  height: 100%;
  > .btn {
    flex-grow: 1;
    background-color: #ccc;
    color: #222;
    text-align: left;
    border: 0;
    border-left: 4px solid #555;
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
    transition: background-color 0.3s;
    &:not(:last-child) {
      margin-bottom: 5px;
    }
    > span {
      padding-left: 10px;
    }
    > img {
      max-height: 44px;
      width: auto;
    }
  }
}
.video-container,
.actions {
  min-width: 640px;
  max-width: 640px;
}
.player {
  position: relative;
}
.next-track-countdown {
  text-shadow: #222 0 1px 2px;
  position: absolute;
  top: 200px;
  z-index: 10000;
  font-weight: 400;
  width: 100%;
  color: white;
  font-size: 30px;
  text-align: center;
  > .countdown {
    line-height: 40px;
    font-size: 60px;
  }
}
.btn.selected {
  background: orange;
}
.actions {
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
