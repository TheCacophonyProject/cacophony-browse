<template>
  <div class="container">
    <h2>
      Stations
      <help>
        Stations are named GPS locations. You can add them with a CSV file
        exported from a trap.nz account.
      </help>
    </h2>
    <div>
      <div v-if="groupHasStations && pendingStations.length === 0">
        <p>Stations that are currently associated with this group</p>
        <p class="update-info" v-if="assignedRecordingsCount !== null">
          Success!
          <strong>{{ assignedRecordingsCount }} recordings</strong> were
          assigned to stations.
        </p>
        <p
          class="update-warnings"
          v-if="updateWarnings !== null"
          v-html="updateWarningsText"
        />
        <l-map
          ref="stationsMap"
          class="stations-map"
          style="height: 400px"
          :bounds="mapBounds.pad(0.25)"
        >
          <l-control-layers />
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
            v-for="station in stationsForMap"
            :lat-lng="station.location"
            :radius="60"
            :key="`r_${station.name}`"
            :fill-opacity="0.25"
            :weight="1"
            :stroke="false"
            :interative="false"
          />
          <l-circle-marker
            v-for="station in stationsForMap"
            :lat-lng="station.location"
            :key="station.name"
            :radius="5"
            color="black"
            :weight="0.5"
            :fill-opacity="1"
          >
            <l-tooltip>{{ station.name }}</l-tooltip>
          </l-circle-marker>
        </l-map>
        <b-table :items="stations" striped hover>
          <template #cell(name)="data">
            <b-link
              :to="{
                name: 'station',
                params: {
                  groupName,
                  stationName: data.item.name,
                  tabName: 'recordings',
                },
              }"
            >
              {{ data.item.name }}
            </b-link>
          </template>
          <template #cell(latitude)="data">
            <span v-html="Number(data.value).toFixed(5)" />
          </template>
          <template #cell(longitude)="data">
            <span v-html="Number(data.value).toFixed(5)" />
          </template>
        </b-table>
        <div class="bottom-buttons">
          <b-btn
            v-if="!enableEditingStations && isGroupAdmin"
            @click="enableEditingStations = true"
          >
            Edit stations
          </b-btn>
          <b-btn
            v-if="groupHasStations"
            class="export-visits"
            @click="exportVisits"
          >
            <font-awesome-icon icon="download" class="fa-1x" />
            <span>Export TrapNZ Visits for stations</span>
          </b-btn>
        </div>
      </div>
      <p v-else-if="!groupHasStations">
        You currently have no stations associated with this group.
      </p>
      <div
        v-if="isGroupAdmin && canEditStations && !pendingStations.length"
        class="upload-region"
        :class="{ 'dragging-over': draggingCsvOver }"
        @drop.prevent="(e) => droppedStationsCsvFile(e)"
        @dragenter.prevent="(e) => dragCsvFileOver(e)"
        @dragover.prevent="() => {}"
        @dragleave.prevent="(e) => dragCsvFileOut(e)"
      >
        <div v-if="!draggingCsvOver">
          <p>
            Upload Trap.nz CSV defined stations: choose a file, or drag and drop
            one onto this box.
          </p>
          <div>
            <input
              accept=".csv"
              id="upload-csv"
              type="file"
              title="Choose CSV"
              @change="(e) => gotStationsCsvFile(e)"
              class="upload stations"
            />
          </div>
        </div>
        <div v-else class="drag-instructions">Drop your CSV here.</div>
        <div v-if="invalidCsvFormat" class="format-error">
          <p>
            <strong>Error:</strong> The CSV you've uploaded is not valid:
            <span v-html="invalidCsvReason" />
          </p>
        </div>
      </div>
      <div v-else-if="!isGroupAdmin">
        You need to ask your group administrator to add stations
      </div>
      <div v-if="pendingStations.length !== 0">
        <p>The following changes will be made</p>
        <b-table class="station-diff-table" :items="pendingStationsDiff">
          <template #cell(latitude)="data">
            <span v-html="Number(data.value).toFixed(5)" />
          </template>
          <template #cell(longitude)="data">
            <span v-html="Number(data.value).toFixed(5)" />
          </template>
        </b-table>
        <b-checkbox class="back-date" v-model="backDateRecordings">
          Apply all stations to recordings starting from a date
        </b-checkbox>
        <div v-if="backDateRecordings" class="back-date">
          <b-form-datepicker v-model="applyStationsFromDate" />
        </div>
        <b-btn @click="() => addNewStations()" :disabled="addingStations">
          <b-spinner v-if="addingStations" type="border" small />
          <span v-if="!addingStations">Confirm changes</span
          ><span v-else>Processing changes</span>
        </b-btn>
        <b-btn @click="pendingStations = []" :disabled="addingStations">
          Discard changes
        </b-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { icon, latLng, latLngBounds } from "leaflet";
import api from "@/api";
import { linzBasemapApiKey } from "@/config";
import * as csv from "csvtojson";
import Help from "@/components/Help.vue";
import {
  LMap,
  LTooltip,
  LWMSTileLayer,
  LControlLayers,
  LCircle,
  LCircleMarker,
} from "vue2-leaflet";

// TODO(jon): Do we want to be able to view retired stations?

const Marker = icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 40],
  shadowUrl: "/marker-shadow.png",
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

interface StationData {
  name: string;
  lat: number;
  lng: number;
}

export default {
  components: {
    LMap,
    LControlLayers,
    LTooltip,
    LCircle,
    LCircleMarker,
    LWMSTileLayer,
    Help,
  },
  name: "StationsTab",
  props: {
    items: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    isGroupAdmin: { type: Boolean, default: false },
    groupName: { type: String, required: true },
  },
  data() {
    return {
      // Stations state
      icon: Marker,
      backDateRecordings: false,
      applyStationsFromDate: null,
      addingStations: false,
      assignedRecordingsCount: null,
      updateWarnings: null,
      enableEditingStations: false,
      invalidCsvFormat: false,
      invalidCsvReason: "",

      pendingStations: [],
      draggingCsvOver: false,
    };
  },
  computed: {
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
    stations() {
      return this.items
        .filter(({ retiredAt }) => retiredAt === null)
        .map(({ name, location }) => ({
          name,
          latitude: location.coordinates[0],
          longitude: location.coordinates[1],
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    canEditStations() {
      return this.enableEditingStations || !this.groupHasStations;
    },
    groupHasStations() {
      return this.stations.length !== 0;
    },
    stationsForMap() {
      // Stations lat/lng as leaflet lat/lng objects
      return this.stations.map(({ name, latitude, longitude }) => ({
        name,
        location: latLng(latitude, longitude),
      }));
    },
    updateWarningsText() {
      return (
        "<strong>Warnings:</strong><br>" +
        this.updateWarnings.replace(/\n/g, "<br>")
      );
    },
    mapBounds() {
      // Calculate the initial map bounds and zoom level from the set of lat/lng points
      return latLngBounds(this.stationsForMap.map(({ location }) => location));
    },
    pendingStationsDiff() {
      // Show pending stations, and mark any existing stations that don't have a match in pending as
      // "will be retired".  Any existing stations with lat/lng changes get marked as "will be updated".
      const diff = {};
      const existingStationsByName = {};
      const pendingStationsByName = {};
      for (const station of this.stations) {
        existingStationsByName[station.name] = station;
      }
      for (const station of this.pendingStations) {
        pendingStationsByName[station.name] = station;
      }
      for (const station of this.stations) {
        if (!pendingStationsByName.hasOwnProperty(station.name)) {
          diff[station.name] = {
            ...station,
            _rowVariant: "retire-item",
            action: "retire",
          };
        } else {
          const updatedStation = pendingStationsByName[station.name];
          const EPSILON = 0.000000000001;
          if (
            Math.abs(updatedStation.latitude - station.latitude) > EPSILON ||
            Math.abs(updatedStation.longitude - station.longitude) > EPSILON
          ) {
            let { latitude, longitude } = updatedStation;
            if (Math.abs(latitude - station.latitude) > EPSILON) {
              latitude = `<del>${station.latitude}</del> -> ${latitude}`;
            }
            if (Math.abs(longitude - station.longitude) > EPSILON) {
              longitude = `<del>${station.longitude}</del> -> ${longitude}`;
            }
            diff[station.name] = {
              ...updatedStation,
              latitude,
              longitude,
              _rowVariant: "update-item",
              action: "update",
            };
          } else {
            diff[station.name] = {
              ...updatedStation,
              _rowVariant: "no-change-item",
              action: "no change",
            };
          }
        }
      }
      for (const station of this.pendingStations) {
        if (!diff.hasOwnProperty(station.name)) {
          diff[station.name] = {
            ...station,
            _rowVariant: "add-item",
            action: "add",
          };
        }
      }
      return (Object.values(diff) as StationData[]).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    },
  },
  methods: {
    exportVisits() {
      alert("To be implemented before release");
      return;
    },
    dragCsvFileOver(event: DragEvent) {
      this.draggingCsvOver = true;
      event.dataTransfer.dropEffect = "none";
    },
    dragCsvFileOut() {
      this.draggingCsvOver = false;
    },
    async droppedStationsCsvFile(event: DragEvent) {
      this.draggingCsvOver = false;
      const csvText = await event.dataTransfer.files[0].text();
      await this.parseStationsCsv(csvText);
    },
    async gotStationsCsvFile(event: Event) {
      const file: File = (event.target as HTMLInputElement).files[0];
      const csvText = await file.text();
      await this.parseStationsCsv(csvText);
    },
    async parseStationsCsv(csvText: string) {
      let monitoring = await csv().fromString(csvText);
      // Make sure the expected fields exist:
      if (
        !monitoring.every(
          (item) =>
            item.hasOwnProperty("Type") &&
            item.hasOwnProperty("Lat") &&
            item.hasOwnProperty("Lon") &&
            item.hasOwnProperty("Number / Code")
        )
      ) {
        this.invalidCsvFormat = true;
        this.invalidCsvReason =
          "Expected headers for <em>'Number / Code', 'Type', 'Lat', 'Lon'</em>";
        return;
      }

      // Don't allow duplicate station names:
      const names = {};
      for (const item of monitoring) {
        const name = item["Number / Code"].toLowerCase();
        if (names.hasOwnProperty(name)) {
          this.invalidCsvFormat = true;
          this.invalidCsvReason = `Duplicate station name <em>'${name}'</em>`;
          return;
        }
      }

      this.invalidCsvFormat = false;
      monitoring = monitoring.map((item) => ({
        ...item,
        Type: item.Type.toLowerCase(),
      }));
      // If the list has items with the "thermal camera" column, use that, else use "camera"
      const cameraKey = monitoring.find(
        (item) => item.Type === "thermal camera"
      )
        ? "thermal camera"
        : "camera";
      const csvCameras = monitoring
        .filter((item) => item.Type === cameraKey)
        .map((item) => ({
          name: item["Number / Code"],
          latitude: item.Lat,
          longitude: item.Lon,
        }));
      if (!csvCameras.length) {
        this.invalidCsvFormat = true;
        this.invalidCsvReason =
          "Supplied CSV has no rows where the 'type' is either 'Camera' or 'Thermal Camera'";
      }
      this.pendingStations = csvCameras;
    },
    async addNewStations() {
      this.addingStations = true;
      this.assignedRecordingsCount = null;
      this.updateWarnings = null;
      {
        let applyFromDate =
          this.backDateRecordings && this.applyStationsFromDate;
        if (applyFromDate) {
          applyFromDate = new Date(Date.parse(applyFromDate));
          applyFromDate.setHours(5);
          applyFromDate.setMinutes(0);
          applyFromDate.setSeconds(0);
          applyFromDate.setMilliseconds(0);
        }
        const { result } = await api.groups.addStationsToGroup(
          this.groupName,
          this.pendingStations.map(({ name, latitude, longitude }) => ({
            name,
            lat: Number(latitude),
            lng: Number(longitude),
          })),
          applyFromDate
        );
        this.$emit("change");
        this.pendingStations = [];
        if (result.warnings) {
          this.updateWarnings = result.warnings;
        }
        if (Object.values(result.updatedRecordingsPerStation).length !== 0) {
          this.assignedRecordingsCount = Object.values(
            result.updatedRecordingsPerStation
          ).reduce((acc: number, count: number) => acc + count, 0);
        }
        this.enableEditingStations = false;
      }
      this.addingStations = false;
    },
  },
};
</script>

<style lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.upload-region {
  width: 100%;
  min-height: 200px;
  border: 5px dashed #ccc;
  padding: 0 30px;
  border-radius: 10px;
  display: flex;
  //align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: background-color 0.3s ease-in-out;
  .format-error {
    width: 100%;
    margin-top: 10px;
    background: #ffc6cd;
    padding: 5px 10px;
    border-radius: 5px;
    > p {
      margin: 0;
    }
  }
  &.dragging-over {
    background-color: #eee;
  }
  .drag-instructions {
    pointer-events: none;
  }
}
.update-info,
.update-warnings {
  background-color: #cff1d7;
  border-radius: 5px;
  padding: 5px 10px;
}
.update-warnings {
  background-color: #f6ddb9;
}
.station-diff-table {
  del {
    color: darkred;
  }
  .table-add-item {
    background: #cff1d7;
  }
  .table-update-item {
    background: #f6ddb9;
  }
  .table-retire-item {
    background: #eecccf;
  }
}
.back-date {
  margin-bottom: 20px;
}

@include media-breakpoint-up(md) {
  .bottom-buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
}
@include media-breakpoint-down(md) {
  .bottom-buttons {
    display: flex;
    flex-direction: column;
    > * {
      margin-bottom: 10px;
    }
  }
}
</style>
