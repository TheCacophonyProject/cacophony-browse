<template>
  <b-container>
    <b-row v-if="!fetched">
      <spinner />
    </b-row>
    <b-row v-else>
      <group-add />
      <b-col class="col-12 col-lg-8 add-button-wrapper">
        <b-button
          v-b-modal.group-add
          variant="primary"
          v-b-tooltip.hover
          class="add-button"
        >
          <font-awesome-icon icon="plus" size="xs" />
          <span>Create group</span>
        </b-button>
      </b-col>

      <b-col v-if="!groups.length" class="col-12 col-lg-8">
        <b-card>
          <h1>
            You don't belong to any groups yet
          </h1>
          <p>
            If you are setting up a device, create a group. All the devices you
            manage will be linked together through this group, so choose a name
            relating to your organisation, project or property.
          </p>
        </b-card>
      </b-col>
      <b-col v-else class="col-12 col-lg-8">
        <div class="list-group">
          <router-link
            v-for="(group, index) in orderedGroups"
            :key="index"
            :to="{ name: 'group', params: { groupname: group.groupname } }"
            class="list-group-item list-group-item-action"
          >
            {{ group.groupname }}
            <font-awesome-icon class="icon" icon="chevron-right" size="xs" />
          </router-link>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapState } from "vuex";
import Spinner from "../Spinner.vue";
import GroupAdd from "../Groups/GroupAdd.vue";

export default {
  name: "GroupListing",
  components: { Spinner, GroupAdd },
  computed: mapState({
    groups: state => state.Groups.groups,
    fetched: state => state.Groups.fetched,
    orderedGroups: function() {
      return this.groups.sort((a, b) => a.groupname.localeCompare(b.groupname));
    }
  })
};
</script>

<style lang="scss" scoped>
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.add-button-wrapper {
  text-align: right;
}

@include media-breakpoint-down(sm) {
  .add-button {
    position: fixed;
    bottom: 1em;
    right: 1em;
    z-index: 2;
  }
}

@include media-breakpoint-up(sm) {
  .add-button {
    margin-bottom: 1em;
  }
}

.list-group {
  .list-group-item-action {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
    overflow: auto;
    .icon {
      color: $link-color;
    }
  }
}
</style>
