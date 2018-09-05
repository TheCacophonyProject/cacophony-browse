<template v-if="groups">
  <b-container>
    <h1>Groups</h1>
    <group-listing :groups="groups" />
    <group-add />
  </b-container>
</template>

<script>

import GroupAdd from '../components/Groups/GroupAdd.vue';
import GroupListing from '../components/Groups/GroupListing.vue';
import {mapState} from 'vuex';

export default {
  name: 'GroupsView',
  components: {
    GroupAdd,
    GroupListing
  },
  computed:
    mapState({
      groups: state => state.Groups.groups
    })
  ,
  watch: {
    '$route' () {
      this.fetchGroups();
    }
  },
  created: function () {
    this.fetchGroups();
  },
  methods: {
    fetchGroups: function () {
      this.$store.dispatch('Groups/GET_GROUPS');
    }
  }
};
</script>
