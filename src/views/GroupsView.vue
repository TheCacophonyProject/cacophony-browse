<template v-if="groups">
  <b-container>
    <h1>Your Groups <help :help-text="helpTip"/></h1>
    <group-listing :groups="groups" />
    <group-add />
  </b-container>
</template>

<script>
import GroupAdd from "../components/Groups/GroupAdd.vue";
import GroupListing from "../components/Groups/GroupListing.vue";
import Help from "../components/Help.vue";
import { mapState } from "vuex";

export default {
  name: "GroupsView",
  components: {
    GroupAdd,
    GroupListing,
    Help
  },
  data() {
    return {
      helpTip: {
        title: "Groups",
        content:
          "<p>Groups link together devices with the users who can view their recordings</p> " +
          "<p>Click on a group to see its devices and users.</p>"
      }
    };
  },
  computed: mapState({
    groups: state => state.Groups.groups
  }),
  watch: {
    $route() {
      this.fetchGroups();
    }
  },
  created: function() {
    this.fetchGroups();
  },
  methods: {
    fetchGroups: function() {
      this.$store.dispatch("Groups/GET_GROUPS");
    }
  }
};
</script>
