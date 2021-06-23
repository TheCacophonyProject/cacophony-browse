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
      @load-more="() => requestVisits(true, [])"
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
import { NewVisit } from "@/api/Monitoring.api";
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
      totalVisitsCount: null,
      totalVisitsPages: null,
      loading: true,
      allLoaded: false,
      currentPage: 1,
      startDateOfQuery: Date,
    };
  },
  async mounted() {
    await this.fetchVisits();
  },
  methods: {
    async requestVisits(markStart: boolean = false, pendingVisits: NewVisit[]) {
      // Keep track of the offset of the page.
      if (
        this.totalVisitsPages === null ||
        this.currentPage < this.totalVisitsPages
      ) {
        this.currentPage += 1;
        this.loading = true;
        try {
          const { result } = await api.monitoring.queryVisitPage({
            ...this.visitsQuery,
            page: this.currentPage,
          });

          if (!this.totalVisitsCount) {
            this.totalVisitsPages = result.params.pagesEstimate;
            this.totalVisitsCount =
              result.params.pagesEstimate * LOAD_PER_PAGE_CARDS;
          }

          if (markStart && result.visits.length) {
            this.startDateOfQuery = new Date(result.visits[0].timeEnd);
          }
          // Get the first visit (latest in time) to work out which day we're querying.
          // Then continue querying until we get a visit that is not in that 24hr span.
          const earliestEndDateOfQuery = new Date(this.startDateOfQuery);
          earliestEndDateOfQuery.setDate(this.startDateOfQuery.getDate() - 1);
          const containsPrevDay = result.visits.some((visit) => {
            return new Date(visit.timeEnd) < earliestEndDateOfQuery;
          });

          // Collect up visits into pendingVisits until we have a full days worth, then update the model.
          pendingVisits.push(...result.visits);
          if (!containsPrevDay) {
            console.log("Ask for more visits up to end of day");
            await this.requestVisits(false, pendingVisits);
          } else {
            this.visits.push(...pendingVisits);
          }
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
        await this.requestVisits(true, []);
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
