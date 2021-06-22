<template>
  <div class="container">
    <h2>
      All visits - {{ groupName
      }}<span v-if="deviceName || stationName"
        >, {{ `${deviceName || stationName || ""}` }}</span
      >
      <help>
        All visits ever recorded for this
        {{ `${deviceName ? "device" : stationName ? "station" : "group"}` }}
      </help>
    </h2>
    <VisitsList
      :query-pending="loading"
      :visits="visits"
      :all-loaded="allLoaded"
      :view-visits-query="visitsQuery"
      @load-more="requestVisits"
    />
    <div v-if="!loading && visits.length === 0">
      No visits found for this
      {{ `${deviceName ? "device" : stationName ? "station" : "group"}` }}
    </div>
  </div>
</template>

<script lang="ts">
import Help from "@/components/Help.vue";
import api from "@/api";
import VisitsList from "@/components/VisitsList.vue";
const LOAD_PER_PAGE_CARDS = 10;

// TODO(jon): A histogram of activity by hour of the night.  Total visits, and by species.

export default {
  name: "VisitsTab",
  components: {
    VisitsList,
    Help,
  },
  props: {
    groupName: { type: String, required: true },
    deviceName: { type: String, required: false, default: null },
    stationName: { type: String, required: false, default: null },
    visitsQuery: { type: Object, required: true },
  },
  data() {
    return {
      visits: [],
      totalVisitsCount: 0,
      totalVisitsPages: 0,
      loading: true,
      allLoaded: false,
      currentPage: 1,
    };
  },
  async mounted() {
    await this.fetchVisits();
  },
  methods: {
    async requestVisits() {
      // Keep track of the offset of the page.
      const nextQuery = { ...this.visitsQuery };
      nextQuery.page = this.currentPage;
      // Make sure the request wouldn't go past the count?
      if (this.currentPage < this.totalVisitsPages) {
        this.currentPage += 1;
        this.loading = true;
        try {
          const { result } = await api.monitoring.queryVisitPage(nextQuery);
          this.visits.push(...result.visits);
          // eslint-disable-next-line no-empty
        } catch (e) {}
        this.loading = false;
      } else {
        // At end of search
        this.allLoaded = true;
      }
    },
    async fetchVisits() {
      if (
        (this.visitsQuery.group &&
          this.visitsQuery.group.length &&
          this.visitsQuery.group[0] !== null) ||
        (this.visitsQuery.device &&
          this.visitsQuery.device.length &&
          this.visitsQuery.device[0] !== null) ||
        (this.visitsQuery.station &&
          this.visitsQuery.station.length &&
          this.visitsQuery.station[0] !== null)
      ) {
        this.loading = true;
        try {
          const { result } = await api.monitoring.queryVisitPage(
            this.visitsQuery
          );
          this.totalVisitsPages = result.params.pagesEstimate;
          this.totalVisitsCount =
            result.params.pagesEstimate * LOAD_PER_PAGE_CARDS;
          this.visits = result.visits;
        } catch (e) {
          //
        }
        this.loading = false;
      }
    },
  },
  watch: {
    visitsQuery() {
      // TODO(jon): Make sure we allow inactive devices to show recordings.
      this.fetchVisits();
    },
  },
};
</script>

<style lang="scss">
.device-health {
  color: darkgray;
  &.healthy {
    color: #dc3545;
  }
}
.table-okay {
  border-left: 10px solid #cff1d7;
}
.table-warn {
  border-left: 10px solid #eecccf;
}
</style>
