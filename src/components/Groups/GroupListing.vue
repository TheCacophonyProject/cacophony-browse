<template>
  <div>

    <spinner :fetching="!fetched"/>

    <div v-if="fetched && !groups.length">
      <p>
        <icon-link
          :icon="['fas', 'exclamation-triangle']"/>
        You don't belong to any groups.</p>
      <p>If you are setting up a device, create a group below.  All the devices you
      manage will be linked together through this group, so choose a name relating to your organisation, project or property.
      </p>
    </div>
    <div
      v-for="(group, index) in orderedGroups"
      :key="index"
      class="group">

      <router-link
        :to="{ name: 'group', params: { groupname: group.groupname }}"
        tag="div"
        class="header">

        <h4>{{ group.groupname }}</h4>

        <icon-link
          :icon="['fas', 'angle-right']"
          :link="{ name: 'group', params: { groupname: group.groupname }}"
          :position="'right'"/>
      </router-link>
    </div>
  </div>
</template>

<script>

import {mapState} from 'vuex';
import Spinner from '../Spinner.vue';
import IconLink from '../IconLink.vue';

export default {
  name: "GroupListing",
  components: {Spinner, IconLink},
  computed: mapState({
    groups: state => state.Groups.groups,
    fetched: state => state.Groups.fetched,
    orderedGroups: function () {
      return this.groups.sort((a, b) => a.groupname.localeCompare( b.groupname) );
    }
  })
};
</script>

<style scoped>

  h4 {
    margin-top: 0.75rem;
    font-size: 1rem;
  }
  .group {
    padding: 0.75rem;
    border-top: 1px solid #dee2e6;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
  }

  p {
    display: flex;
  }
</style>
