<template>
  <b-list-group-item
    :to="{ path: 'recordings', query: query }"
    class="d-flex justify-content-between align-items-center"
  >
    {{ group.groupname }}
    <b-badge v-if="count > 0" pill variant="primary" class="ml-auto">
      {{ count }}
    </b-badge>
  </b-list-group-item>
</template>

<script>
import { mapState } from "vuex";
import api from "../api/Recording.api";

export default {
  name: "HomeGroupItem",
  props: {
    group: {
      type: Object,
      required: true
    }
  },
  data: function() {
    return {
      count: 0
    };
  },
  computed: {
    ...mapState({
      groups: state => state.Groups.groups
    }),
    query() {
      return {
        where: JSON.stringify({
          DeviceId: this.group.Devices.map(d => d.id)
        })
      };
    }
  },
  async mounted() {
    // Last 24 hours
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);
    const dateQuery = {
      $gt: fromDate.toISOString(),
      $lt: toDate.toISOString()
    };

    // Query params
    const where = {
      recordingDateTime: dateQuery,
      DeviceId: this.group.Devices.map(d => d.id)
    };
    const limit = 1000;
    const params = {
      where: JSON.stringify(where),
      limit: limit,
      offset: 0,
      tagMode: "any"
    };

    // Get all data (first 1000 rows)
    let { result: allData } = await api.query(params);
    // Check whether all data was fetched
    // if not, run again with increased limit to get all rows
    if (allData.count > limit) {
      params.limit = allData.count;
      ({ result: allData } = await api.query(params));
    }
    this.count = allData.count;
  }
};
</script>

<style scoped></style>
