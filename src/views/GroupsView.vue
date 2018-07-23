<template>
  <b-container fluid>
    <h1>Groups</h1>

    <div v-if="!groupData">Loading...</div>

    <template v-if="groupData">
      <b-row>
        <b-table
          :items="groupData.groups"
          :fields="groupsTableFields"
          striped
          hover
          responsive>

          <template
            slot="groupname"
            slot-scope="row">
            <b-link :to="{ name: 'groups', params: { groupname: row.item.groupname }}">{{ row.item.groupname }}</b-link>
          </template>

          <template
            slot="owner"
            slot-scope="cell">
            <!-- TODO: Should group admin field link to a page? -->
            <b-link :to="{ path: '/users', query: { id: groupData.owner.id }}">{{ groupData.owner.username }}</b-link>
          </template>

        </b-table>
      </b-row>

    </template>
  </b-container>
</template>

<script>

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'GroupsView',
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {},
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data () {
    return {
      groupsTableFields: [
        {key: 'id', label: 'Id'},
        {key: 'groupname', label: 'Group'},
        'owner'
      ]
    };
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {
    groupData() {
      if(!this.$store.state.Groups.fetching) {
        const groups = this.$store.state.Groups.groups;
        return {
          groups,
          owner: groups[0].Users[0]
        };
      }
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
