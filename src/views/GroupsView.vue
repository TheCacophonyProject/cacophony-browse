<template>
  <b-container>
    <h1>Groups</h1>

    <group-users
      :groups="groupData.groups"
      :owner="groupData.owner" />

    <groups-add />

  </b-container>
</template>

<script>

import GroupsAdd from '../components/Groups/GroupsAdd.vue';
import GroupUsers from '../components/Groups/GroupUsers.vue';

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'GroupsView',
  components: {
    GroupsAdd,
    GroupUsers
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {
    groupData() {
      const groups = this.$store.state.Groups.groups;
      return {
        groups,
        owner: groups.length ? groups[0].Users[0] : {}
      };
    }
  },
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
      this.$store.dispatch('Groups/GET_GROUPS', this.$route.params.groupname);
    }
  }
};
</script>
