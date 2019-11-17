<template>
  <b-container fluid style="padding: 0">
    <b-jumbotron class="jumbotron-admin" fluid>
      <div>
        <b-link
          :to="{
            name: 'groups'
          }"
        >
          <font-awesome-icon icon="angle-left" size="xs" />
          <span>Back to groups</span>
        </b-link>
      </div>
      <h1>
        <font-awesome-icon icon="users" size="xs" />
        <span v-if="!fetched" class="group-name-placeholder"
          >loading group name</span
        >
        <span v-else>
          {{ group && group.groupname }}
        </span>
      </h1>
      <p class="lead">
        Manage the users associated with this group and view the devices
        associated with it.
      </p>
    </b-jumbotron>

    <spinner :fetching="!fetched" />
    <div v-if="group && fetched">
      <group-detail :group="group" :user="currentUser" />
    </div>
  </b-container>
</template>

<script>
import { mapState } from "vuex";
import GroupDetail from "../components/Groups/GroupDetail.vue";
import Spinner from "../components/Spinner.vue";

export default {
  name: "GroupView",
  components: { GroupDetail, Spinner },
  props: {},
  data() {
    return {
      addGroupUserName: null,
      addGroupUserAdmin: false,
      addUserErrorMessage: null
    };
  },
  computed: mapState({
    group: state => state.Groups.currentGroup,
    fetched: state => state.Groups.fetched,
    currentUser: state => state.User.userData
  }),
  watch: {
    $route() {
      this.fetchGroup();
    }
  },
  created: async function() {
    await this.fetchGroup();
  },
  methods: {
    fetchGroup: async function() {
      await this.$store.dispatch(
        "Groups/GET_GROUP",
        this.$route.params.groupname
      );
    }
  }
};
</script>

<style scoped>
.group-name-placeholder {
  color: #ccc;
  font-style: italic;
}
</style>
