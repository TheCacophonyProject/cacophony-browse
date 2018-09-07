<template>
  <b-container>
    <h2>Device</h2>
    <spinner :fetching="!fetched"/>
    <div v-if="group && fetched">
      <header>
        <h1>{{ group.groupname }}</h1>
        <b-link
          class="hide-button"
          @click="back()">
          <font-awesome-icon
            :icon="['far', 'window-close']"
            size="2x"
            style="cursor: pointer;"/>
        </b-link>
      </header>
      <group-detail
        :group="group"
        :user="currentUser"
      />
    </div>
  </b-container>
</template>

<script>

import {mapState} from 'vuex';
import GroupDetail from '../components/Groups/GroupDetail.vue';
import Spinner from '../components/Spinner.vue';

export default {
  name: 'GroupView',
  components: {GroupDetail, Spinner},
  props: {},
  data() {
    return {
      addGroupUserName: null,
      addGroupUserAdmin: false,
      addUserErrorMessage: null,
      userTableFields: [
        {key: 'username', label: 'User'},
        {key: 'isAdmin', label: 'Admin'},
        {key: 'deleteButton', label: ''}
      ]
    };
  },
  computed:
    mapState({
      group: state => state.Groups.currentGroup,
      fetched: state => state.Groups.fetched,
      currentUser: state => state.User.userData
    })
  ,
  watch: {
    '$route'() {
      this.fetchGroup();
    }
  },
  created: async function () {
    await this.fetchGroup();
  },
  methods: {
    fetchGroup: async function () {
      await this.$store.dispatch('Groups/GET_GROUP', this.$route.params.groupname);
    },
    back: function () {
      this.$router.history.go(-1);
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
    margin: 1.5rem 0;
  }

  h1 {
    margin: 0;
  }
</style>
