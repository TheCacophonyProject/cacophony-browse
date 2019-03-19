<template>
  <div>
    <h3>Your groups</h3>
    <p>Click on a group to view the last 24 hours of recordings in that group</p>

    <b-list-group>
      <HomeGroupItem
        v-for="group in groups"
        :key="group.id"
        :group="group"
      />
    </b-list-group>
  </div>
</template>

<script>

import HomeGroupItem from './HomeGroupItem.vue';
import { mapState } from 'vuex';

export default {
  name: "HomeGroups",
  components: { HomeGroupItem },
  computed: mapState({
    groups: state => state.Groups.groups,
  }),
};
</script>

<style scoped>

</style>
