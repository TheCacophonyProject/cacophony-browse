<template>
  <div>
    <h3>Your groups</h3>
    <p>Click on a group to view the last 24 hours of recordings in that group</p>

    <b-list-group>
      <HomeGroupItem
        v-for="group in orderBy(groups, 'groupname')"
        :key="group.id"
        :group="group"
      />
    </b-list-group>
  </div>
</template>

<script>

import HomeGroupItem from './HomeGroupItem.vue';
import { mapState } from 'vuex';
import Vue2Filters from 'vue2-filters';

export default {
  name: "HomeGroups",
  components: { HomeGroupItem },
  mixins: [Vue2Filters.mixin],
  computed: mapState({
    groups: state => state.Groups.groups,
  })
};
</script>

<style scoped>

</style>
