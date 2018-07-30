<template>
  <b-table
    :items="groups"
    :fields="groupsTableFields"
    striped
    hover
    responsive>

    <template
      slot="groupname"
      slot-scope="row">
      <b-link :to="{ name: 'group', params: { groupname: row.item.groupname }}">{{ row.item.groupname }}</b-link>
    </template>

    <template
      slot="owner"
      slot-scope="cell">
      <!-- TODO: Should group admin field link to a page? -->
      <b-link :to="{ path: '/users', query: { id: owner.id }}">{{ owner.username }}</b-link>
    </template>

  </b-table>
</template>

<script>
export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'GroupsView',
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {
    groups: {
      type: Array,
      required: true
    },
    owner: {
      type: Object,
      required: true
    }
  },
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data () {
    return {
      groupsTableFields: [
        {key: 'id', label: 'Id'},
        {key: 'groupname', label: 'Group'},
        'owner'
      ]
    };
  }
};
</script>
