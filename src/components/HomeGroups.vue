<template>
  <div>
    <h3>Your groups</h3>
    <p>
      Click on a group to view the last 24 hours of recordings in that group
    </p>

    <div id="group-list-container" style="max-height: 50vh; overflow-y: auto;">
      <b-list-group>
        <HomeGroupItem
          v-for="(group, index) in orderBy(groups, 'groupname')"
          :key="index"
          :group="group"
        />
      </b-list-group>
    </div>
  </div>
</template>

<script>
import HomeGroupItem from "./HomeGroupItem.vue";
import { mapState } from "vuex";
import Vue2Filters from "vue2-filters";

export default {
  name: "HomeGroups",
  components: { HomeGroupItem },
  mixins: [Vue2Filters.mixin],
  computed: mapState({
    groups: state => state.Groups.groups
  })
};
</script>

<style scoped></style>
