<template>
  <b-container>
    <header v-if="fetched">
      <h1>Group: {{ group.groupname }}</h1>
      <icon-link
        :icon="['fas', 'angle-left']"
        :link="{ name: 'groups' }"
        :position="'right'"
      />
    </header>
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
import IconLink from "../components/IconLink.vue";

export default {
  name: "GroupView",
  components: { GroupDetail, Spinner, IconLink },
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
header {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  margin: 1.5rem 0 -1.5em 0;
}

h1 {
  font-weight: bold;
  font-size: x-large;
  margin: 0;
}
</style>
