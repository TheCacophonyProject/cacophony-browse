<template>
  <div>
    <h3>Your groups</h3>
    <p>
      Click on a group to view the last 24 hours of recordings in that group
    </p>

    <div id="group-list-container" style="max-height: 50vh; overflow-y: auto;">
      <b-list-group>
        <HomeGroupItem
          v-for="(group, index) in orderedGroups"
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

export default {
  name: "HomeGroups",
  components: { HomeGroupItem },
  computed: {
    ...mapState({
      groups: state => state.Groups.groups
    }),
    orderedGroups: {
      get() {
        return [...this.groups].sort((a, b) => {
          return a.groupname.toLowerCase() < b.groupname.toLowerCase() ? -1 : 1;
        });
      }
    }
  }

  // TODO(jon): Would be better to have a single API query to load recording counts for all groups the user is
  //  is part of.
};
</script>

<style scoped></style>
