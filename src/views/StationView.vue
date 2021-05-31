<template>
  <b-container fluid class="admin outer">
    <l-map
      v-if="mapBounds"
      ref="stationsMap"
      class="stations-map"
      style="height: 200px"
      :options="{ zoomControl: false }"
      :bounds="mapBounds.pad(0.5)"
    >
      <l-w-m-s-tile-layer
        v-for="layer in mapLayers"
        :key="layer.name"
        :base-url="layer.url"
        :layers="layer.layers"
        :visible="layer.visible"
        :name="layer.name"
        :attribution="layer.attribution"
        layer-type="base"
      />
      <l-circle
        :lat-lng="location"
        :radius="60"
        :key="`r_${station.name}`"
        :fill-opacity="0.25"
        :weight="1"
        :stroke="false"
        :interative="false"
      />
      <l-circle-marker
        :lat-lng="location"
        :key="station.name"
        :radius="5"
        color="black"
        :weight="0.5"
        :fill-opacity="1"
      >
        <l-tooltip>{{ station.name }}</l-tooltip>
      </l-circle-marker>
    </l-map>
    <b-jumbotron class="jumbotron" fluid>
      <div>
        <h1>
          <router-link
            v-if="userIsMemberOfGroup"
            :to="{
              name: 'group',
              params: {
                groupName,
                tabName: 'stations',
              },
            }"
          >
            <font-awesome-icon
              icon="users"
              size="xs"
              style="color: #666; font-size: 16px"
            />
            <span>{{ groupName }}</span>
          </router-link>
          <span v-else>
            <font-awesome-icon
              icon="users"
              size="xs"
              style="color: #666; font-size: 16px"
            />
            <span>{{ groupName }}</span>
          </span>
          <font-awesome-icon
            icon="chevron-right"
            size="xs"
            style="color: #666; font-size: 16px"
          />
          <font-awesome-icon icon="map-marker-alt" size="xs" />
          <span>{{ stationName }}</span>
        </h1>
      </div>
      <div>
        <p class="lead">Manage this station.</p>
      </div>
    </b-jumbotron>
    <div v-if="!loadedStation" class="container no-tabs">
      Loading station...
      <spinner />
    </div>
    <div v-else-if="station" class="tabs-container">
      <b-tabs
        card
        class="group-tabs"
        nav-class="container"
        v-model="currentTabIndex"
      >
        <b-tab lazy>
          <template #title>
            <TabTemplate
              title="Recordings"
              :isLoading="recordingsCountLoading"
              :value="recordingsCount"
            />
          </template>
          <RecordingsTab
            :loading="recordingsCountLoading"
            :group-name="groupName"
            :station-name="stationName"
            :recordings-query="recordingsQueryFinal"
          />
        </b-tab>
      </b-tabs>
    </div>
    <div v-else class="container no-tabs">
      Sorry but group <i> &nbsp; {{ groupName }} &nbsp; </i> does not have a
      station called <i> &nbsp; {{ stationName }}</i
      >.
    </div>
  </b-container>
</template>

<script lang="ts">
import { mapState } from "vuex";
import Spinner from "../components/Spinner.vue";
import api from "../api/index";
import TabTemplate from "@/components/TabTemplate";
import RecordingsTab from "@/components/RecordingsTab";
import { linzBasemapApiKey } from "@/config";
import { latLng, latLngBounds } from "leaflet";
import {
  LCircle,
  LCircleMarker,
  LMap,
  LTooltip,
  LWMSTileLayer,
} from "vue2-leaflet";

export default {
  name: "StationView",
  components: {
    Spinner,
    TabTemplate,
    RecordingsTab,
    LMap,
    LTooltip,
    LCircle,
    LCircleMarker,
    LWMSTileLayer,
  },
  computed: {
    ...mapState({
      currentUser: (state) => state.User.userData,
    }),
    mapLayers() {
      const OpenStreetMapFallbackLayer = {
        name: "OpenStreetMap Basemap",
        visible: false,
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      };
      if (linzBasemapApiKey && linzBasemapApiKey !== "YOUR_API_KEY_HERE") {
        return [
          {
            name: "LINZ Basemap",
            visible: true, // Make the LINZ basemap the default one
            attribution:
              '<a href="//www.linz.govt.nz/data/linz-data/linz-basemaps/data-attribution">LINZ CC BY 4.0 © Imagery Basemap contributors</a>',
            url: `https://basemaps.linz.govt.nz/v1/tiles/aerial/3857/{z}/{x}/{y}.webp?api=${linzBasemapApiKey}`,
          },
          OpenStreetMapFallbackLayer,
        ];
      }
      return [{ ...OpenStreetMapFallbackLayer, visible: true }];
    },
    userIsSuperUserAndViewingAsSuperUser() {
      return false;
    },
    userIsMemberOfGroup() {
      return (
        this.userIsSuperUserAndViewingAsSuperUser ||
        (this.group.GroupUsers &&
          this.group.GroupUsers.find(
            ({ username }) => username === this.currentUser.username
          ) !== undefined)
      );
    },
    stationName() {
      return this.$route.params.stationName;
    },
    groupName() {
      return this.$route.params.groupName;
    },
    location() {
      if (this.station) {
        return latLng(
          this.station.location.coordinates[0],
          this.station.location.coordinates[1]
        );
      }
      return null;
    },
    mapBounds() {
      // Calculate the initial map bounds and zoom level from the set of lat/lng points
      if (this.station) {
        return latLngBounds([this.location]);
      }
      return null;
    },
  },
  data() {
    return {
      loadedStation: false,
      recordingsCountLoading: false,
      recordingsCount: 0,
      currentTabIndex: 0,
      recordingsQueryFinal: {},
      station: null,
      group: {},
    };
  },
  mounted() {
    this.fetchStation();
  },
  methods: {
    async fetchStation() {
      try {
        // eslint-disable-next-line no-unused-vars
        const [group, stations] = await Promise.all([
          api.groups.getGroup(this.groupName),
          api.groups.getStationsForGroup(this.groupName),
        ]);
        this.group = group.result.groups[0];
        this.station = stations.result.stations.find(
          (station) => station.name === this.stationName
        );
        this.recordingsQueryFinal = {
          tagMode: "any",
          offset: 0,
          limit: 20,
          page: 1,
          days: "all",
          station: [this.station.id],
        };
        this.recordingsCountLoading = true;
        const result = await api.recording.queryCount(
          this.recordingsQueryFinal
        );
        this.recordingsCount = result.result.count;
        this.recordingsCountLoading = false;
      } catch (e) {
        // TODO - we will move away from global error handling, and show any errors locally in the component
      }
      this.loadedStation = true;
    },
  },
};
</script>
<style lang="scss">
.admin .jumbotron {
  margin-bottom: unset;
}
.admin.outer {
  position: relative;
  .jumbotron {
    top: 0;
    position: absolute;
    width: 100%;
    background: transparent;
    z-index: 10000;
    h1,
    p.lead {
      padding: 3px;
      background: white;
      display: inline-block;
    }
  }
  .tabs-container {
    position: relative;
    z-index: 10000;
    margin-top: -54px;
    .group-tabs .card-header {
      background: unset;
    }
  }
}
.stations-map {
  pointer-events: none;
}
</style>
