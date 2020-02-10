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
        <b-card class="no-content-placeholder">
          <h5>
            You don't belong to any groups yet
          </h5>
          <p>
            If you are setting up a device, create a group. All the devices you
            manage will be linked together through this group, so choose a name
            relating to your organisation, project or property.
          </p>
        </b-card>
      </b-col>
      <b-col v-else class="col-12 col-lg-8">
        <div class="list-wrapper" data-cy="groups-list">
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
