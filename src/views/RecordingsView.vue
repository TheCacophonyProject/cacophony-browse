<template>
  <b-container fluid>
    <b-row>
      <div
        :class="[
          'search-filter-wrapper',
          { 'is-collapsed': searchPanelIsCollapsed },
        ]"
      >
        <QueryRecordings
          ref="queryRec"
          :disabled="queryPending"
          :is-collapsed="searchPanelIsCollapsed"
          :simple-only="false"
          @mounted="querySubmitted"
          @submit="querySubmitted"
          @description="saveNextQueryDescription"
          @toggled-search-panel="
            searchPanelIsCollapsed = !searchPanelIsCollapsed
          "
        />
      </div>
      <div :class="['search-content-wrapper', { 'display-rows': !showCards }]">
        <div class="search-results">
          <div class="results-summary">
            <div class="float-right">
              <b-button
                variant="light"
                class="display-toggle btn-sm"
                @click="toggleResultsDisplayStyle"
              >
                Display as {{ showCards ? "rows" : "cards" }}
              </b-button>
              <CsvDownload :params="serialisedQuery" />
            </div>

            <h1>Recordings</h1>
            <h2 v-if="countMessage">
              {{ countMessage }}
            </h2>
            <h5 v-else>Loading...</h5>
            <p class="search-description" v-html="currentQueryDescription" />
          </div>
          <RecordingsList
            :recordings="recordings"
            :query-pending="queryPending"
          />
          <div v-if="countMessage === 'No matches'" class="no-results">
            <h6 class="text-muted">No recordings found</h6>
            <p class="small text-muted">Try modifying your search criteria.</p>
          </div>
        </div>

        <div class="sticky-footer">
          <div class="pagination-per-page">
            <b-form-select
              id="recordsPerPage"
              v-model="perPage"
              :options="perPageOptions"
              class="results-per-page"
              @change="perPageChanged"
            />
            <b-pagination
              :total-rows="count"
              v-model="currentPage"
              :per-page="perPage"
              :limit="limitPaginationButtons"
              class="pagination-buttons"
              @change="pagination"
              v-if="count > perPage"
            />
          </div>
        </div>
      </div>
    </b-row>
  </b-container>
</template>
<script>
import QueryRecordings from "../components/QueryRecordings/QueryRecordings.vue";
import CsvDownload from "../components/QueryRecordings/CsvDownload.vue";
import RecordingsList from "../components/RecordingsList.vue";
import api from "../api/index";
import { toStringTodayYesterdayOrDate } from "@/helpers/datetime";

export default {
  name: "RecordingsView",
  components: { QueryRecordings, CsvDownload, RecordingsList },
  props: {},
  data() {
    return {
      currentQueryDescription: null,
      nextQueryDescription: null,
      serialisedQuery: {},
      queryPending: false,
      searchPanelIsCollapsed: true,
      recordings: [],
      count: null,
      countMessage: null,
      currentPage: 1,
      perPage: 100,
      showCards: this.getPreferredResultsDisplayStyle(),
      limitPaginationButtons: 5,
      perPageOptions: [
        { value: 10, text: "10 per page" },
        { value: 50, text: "50 per page" },
        { value: 100, text: "100 per page" },
        { value: 300, text: "300 per page" },
        { value: 500, text: "500 per page" },
        { value: 1000, text: "1000 per page" },
      ],
    };
  },
  watch: {
    $route() {
      if (this.$route.query.limit) {
        this.perPage = Number(this.$route.query.limit);
      } else {
        this.perPage = 100;
      }
      if (this.$route.query.offset) {
        this.currentPage =
          Math.ceil(this.$route.query.offset / this.perPage) + 1;
      } else {
        this.currentPage = 1;
      }
    },
  },
  mounted() {
    if (this.$route.query.limit) {
      this.perPage = Number(this.$route.query.limit);
    }
    if (this.$route.query.offset) {
      this.currentPage = Math.ceil(this.$route.query.offset / this.perPage) + 1;
    }
  },
  computed: {
    viewRecordingQuery() {
      const queryCopy = JSON.parse(JSON.stringify(this.serialisedQuery));

      // delete date data as we use this to find the next/previous recordings
      delete queryCopy.days;
      delete queryCopy.from;
      delete queryCopy.to;

      // delete type as this is controlled by the view
      delete queryCopy.type;
      delete queryCopy.limit;
      delete queryCopy.offset;

      return queryCopy;
    },
  },
  methods: {
    pagination(page) {
      this.paginationHasChanged(page, this.perPage);
    },
    perPageChanged(perPage) {
      this.currentPage = 0;
      this.paginationHasChanged(this.currentPage, perPage);
    },
    getPreferredResultsDisplayStyle() {
      return localStorage.getItem("results-display-style") !== "row";
    },
    toggleResultsDisplayStyle() {
      this.showCards = !this.showCards;
      localStorage.setItem(
        "results-display-style",
        this.showCards ? "card" : "row"
      );
    },
    makePaginatedQuery(origQuery, page, perPage) {
      const query = Object.assign({}, origQuery);
      query.limit = perPage;
      query.offset = Math.max(0, (page - 1) * perPage);
      return query;
    },
    updateRoute(query) {
      // Catch errors to avoid redundant navigation error
      this.$router
        .push({
          path: "recordings",
          query,
        })
        .catch(() => {});
    },
    paginationHasChanged(page, perPage) {
      const query = this.makePaginatedQuery(
        this.serialisedQuery,
        page,
        perPage
      );
      this.updateRoute(query);
      this.getRecordings(query);
    },
    queryRouteHasChanged(query) {
      const fullQuery = this.makePaginatedQuery(
        query,
        this.currentPage,
        this.perPage
      );
      this.updateRoute(fullQuery);
    },
    querySubmitted(query) {
      const queryParamsHaveChanged =
        JSON.stringify(query) !== JSON.stringify(this.serialisedQuery);
      if (queryParamsHaveChanged) {
        this.currentPage = 0;
      }

      this.serialisedQuery = query;
      const fullQuery = this.makePaginatedQuery(
        query,
        this.currentPage,
        this.perPage
      );
      this.updateRoute(fullQuery);
      this.getRecordings(fullQuery);
    },
    saveNextQueryDescription(description) {
      this.nextQueryDescription = description;
    },
    async getRecordings(whereQuery) {
      // Remove previous values
      this.countMessage = "";
      this.recordings = [];
      // Call API and process results
      this.queryPending = true;
      const { result, success } = await api.recording.query(whereQuery);
      this.queryPending = false;

      // Remove previous values *again* since it's possible for the query to have been called twice
      // since it's async, and then you'd append values twice.
      this.recordings = [];

      if (!success) {
        result.messages &&
          result.messages.forEach((message) => {
            this.$store.dispatch("Messaging/WARN", message);
          });
      } else {
        this.currentQueryDescription = this.nextQueryDescription;
        this.count = result.count;
        if (result.count > 0) {
          this.countMessage = `${result.count} matches found (total)`;
        } else if (result.count === 0) {
          this.countMessage = "No matches";
        }
        this.recordings = result.rows;
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

$main-content-width: 640px;

.search-content-wrapper {
  margin: 0 auto;
  flex-basis: $main-content-width;
  h1 {
    margin: 2rem 0 1.2rem;
  }
  h2 {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
    color: $gray-700;
  }

  .recordings-day {
    position: sticky;
    top: 0;
    background: transparentize($white, 0.15);
    padding: 0.5rem 0;
    font-size: 1em;
    font-weight: 600;
    border-bottom: 1px solid $gray-200;
  }

  .recordings-hour {
    font-size: 0.9em;
    font-weight: 600;
  }

  @include media-breakpoint-down(md) {
    .recordings-hour {
      position: sticky;
      top: 0;
      right: 0;
      text-align: right;
      margin-top: -1rem;
      margin-bottom: 0;
      padding: 0.7rem 0;
    }
    .recordings-day + div .recordings-hour {
      margin-top: -2.8rem;
      margin-bottom: 11px;
    }
  }

  @include media-breakpoint-up(md) {
    .recordings-hour {
      display: inline-block;
      position: sticky;
      float: left;
      top: 40px;
      margin-left: -60px;
      margin-top: 15px;
    }
  }

  .search-results {
    max-width: $main-content-width;
    margin: 0 auto;
    padding: 0 1em;
  }

  &.display-rows {
    .search-results {
      margin: 0;
      width: 100%;
      max-width: calc(100vw - 2em);
    }

    .results {
      overflow: auto;
    }

    .results-rows {
      display: table-row-group;
    }
    .all-rows {
      display: table;
      width: 100%;
      border-top: 1px solid $border-color;
      border-left: 1px solid $border-color;
    }

    .results-header {
      margin-bottom: 0;
      display: table-header-group;
      > div {
        display: table-row;

        > span {
          position: sticky;
          top: 0;
          background: transparentize($white, 0.15);
          padding: 5px;
          font-weight: 700;
          vertical-align: middle;
          display: table-cell;
          border-right: 1px solid $border-color;
          border-bottom: 2px solid $border-color;
        }
      }
    }
  }
}

.recording-placeholder {
  height: 110px;
  margin-bottom: 15px;
}

.no-results {
  display: flex;
  flex-flow: column nowrap;
  margin-top: 20vh;
  text-align: center;
}

.sticky-footer {
  background: $white;
  border-top: 1px solid $gray-200;
  padding: 7px;
  .pagination-per-page {
    max-width: $main-content-width;
    margin: 0 auto;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    .results-per-page {
      width: auto;
      float: right;
    }
  }
  .pagination {
    margin-bottom: 0;
    justify-content: center;
  }
}

.search-filter-wrapper {
  background: $gray-100;
  position: relative;
  border-right: 1px solid $gray-200;
}

@include media-breakpoint-down(md) {
  .search-filter-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    transform: translate(0);
    width: var(--search-panel-width);
    z-index: 2;
    transition: transform 0.2s;
    &.is-collapsed {
      transform: translate(var(--search-panel-offset));
    }
  }
}

@include media-breakpoint-up(md) {
  .search-filter-wrapper {
    flex: 0 0 320px;
  }
  .search-content-wrapper {
    flex: 1 1 $main-content-width;
    position: relative;
    overflow: hidden;
    overflow-y: scroll;
    margin: 0;
    max-height: calc(100vh - var(--navbar-height));
  }
  .sticky-footer {
    position: sticky;
    bottom: 0;
  }
}
.display-toggle {
  margin-right: 5px;
}
</style>
