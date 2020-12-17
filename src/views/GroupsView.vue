<template v-if="groups">
  <b-container fluid class="admin">
    <b-jumbotron class="jumbotron" fluid>
      <h1>Your groups</h1>
      <p class="lead">
        Groups link together devices with the users who can view their
        recordings. Click on a group to see its devices and users.
      </p>
    </b-jumbotron>
    <group-listing :groups="groups" />
  </b-container>
</template>

<script>
import GroupListing from "../components/Groups/GroupListing.vue";
import { mapState } from "vuex";

export default {
  name: "GroupsView",
  components: {
    GroupListing,
  },
  computed: mapState({
    groups: (state) => state.Groups.groups,
  }),
  watch: {
    $route() {
      this.fetchGroups();
    },
  },
  created: function () {
    this.fetchGroups();
  },
  methods: {
    fetchGroups: function () {
      this.$store.dispatch("Groups/GET_GROUPS");
    },
  },
};
</script>
