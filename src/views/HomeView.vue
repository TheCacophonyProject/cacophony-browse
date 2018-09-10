<template>
  <div>
    <Hero/>
    <b-container>
      <h1>Kia ora {{ username }}</h1>
      <dl>
        <dt>Username</dt>
        <dd id="username">{{ username }}</dd>
        <dt v-show="firstname">First name</dt>
        <dd
          v-show="firstname"
          id="firstname">{{ firstname }}
        </dd>
        <dt v-show="lastname">Last name
        </dt>
        <dd
          v-show="lastname"
          id="lastname">{{ lastname }}
        </dd>
        <dt>Email</dt>
        <dd id="email">{{ email }}</dd>
        <dt>Your groups</dt>
        <dd id="groups">
          <span
            v-for="(group, index) in groups"
            :key="index">
            <b-link :to="{ name: 'group', params: { groupname: group.groupname }}">
              {{ group.groupname }}</b-link><span v-if="index+1 !== groups.length">, </span>
          </span>
        </dd>
      </dl>
      <b-link :to="{ name: 'groups'}">Add Group</b-link>
    </b-container>
  </div>
</template>

<script>

import Hero from '../components/Hero.vue';
import {mapState} from 'vuex';

export default {
  name: 'HomeView',
  components: {
    Hero
  },
  computed: mapState({
    user: state => state.User,
    username: state => state.User.userData.username,
    firstname: state => state.User.userData.firstname,
    lastname: state => state.User.userData.lastname,
    email: state => state.User.userData.email,
    groups: state => state.Groups.groups
  }),
  created: function () {
    this.fetchGroups();
  },
  methods: {
    fetchGroups: function () {
      this.$store.dispatch('Groups/GET_GROUPS');
    }
  }
};
</script>
