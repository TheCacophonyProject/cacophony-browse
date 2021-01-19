<template>
  <b-container fluid class="admin">
    <b-jumbotron class="jumbotron" fluid>
      <h1>Your groups</h1>
      <p class="lead">
        Groups link together devices with the users who can view their
        recordings. Click on a group to see its devices and users.
      </p>
    </b-jumbotron>
    <b-container>
      <b-row v-if="isLoading">
        <spinner />
      </b-row>
      <b-row v-else>
        <group-add />
        <b-col class="col-12 col-lg-8 add-button-wrapper">
          <b-button
            v-b-modal.group-add
            variant="primary"
            v-b-tooltip.hover
            title="Add a new group"
            class="add-button"
          >
            <font-awesome-icon icon="plus" size="xs" />
            <span>Create group</span>
          </b-button>
        </b-col>
        <b-col v-if="hasGroups" class="col-12 col-lg-8">
          <div class="list-wrapper" data-cy="groups-list">
            <router-link
              v-for="({ groupname }, index) in groups"
              :key="index"
              :to="{
                name: 'group',
                params: { groupname },
              }"
              class="list-group-item list-group-item-action"
            >
              {{ groupname }}
              <font-awesome-icon class="icon" icon="chevron-right" size="xs" />
            </router-link>
          </div>
        </b-col>
        <b-col v-else class="col-12 col-lg-8">
          <b-card class="no-content-placeholder">
            <h5>You don't belong to any groups yet</h5>
            <p>
              If you are setting up a device, create a group. All the devices
              you manage will be linked together through this group, so choose a
              name relating to your organisation, project or property.
            </p>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </b-container>
</template>

<script lang="ts">
import api from "@/api";
import Spinner from "@/components/Spinner.vue";
import GroupAdd from "@/components/Groups/GroupAdd.vue";

interface GroupsViewData {
  groups: Group[];
  isLoading: boolean;
}

export default {
  name: "GroupsView",
  components: { Spinner, GroupAdd },
  data(): GroupsViewData {
    return {
      groups: [],
      isLoading: false,
    };
  },
  computed: {
    hasGroups(): boolean {
      return this.groups.length !== 0;
    },
  },
  created: function () {
    this.fetchGroups();
  },
  methods: {
    async fetchGroups() {
      this.isLoading = true;
      {
        // TODO(jon): Error handling.
        try {
          const { result } = await api.groups.getGroups();
          // Groups are always ordered alphabetically.
          this.groups = result.groups.sort((a, b) =>
            a.groupname.localeCompare(b.groupname)
          );
        } catch (error) {
          // Do something with the error.
        }
      }
      this.isLoading = false;
    },
  },
};
</script>
