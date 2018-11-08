<template>
  <div>
    <b-container class="kiaora">
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
          <span v-if="!groups.length">
            <p>
              <icon-link
                :icon="['fas', 'exclamation-triangle']"
                :link="{ name: 'devices'}"/>
              You will not see any results as you do not have any devices (cacophonators or cacophonometers)</p>
            <p>If you are setting up your own device you should  <b-link :to="{ name: 'groups'}">create a group </b-link>for your devices.</p>
            <p>Otherwise ask the admin of your device for access to it.</p>
          </span>
        </dd>
      </dl>
    </b-container>
    <Hero/>
  </div>
</template>

<script>

import Hero from '../components/Hero.vue';
import {mapState} from 'vuex';
import IconLink from "../components/IconLink.vue";

export default {
  name: 'HomeView',
  components: {
    Hero,
    IconLink
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

<style scoped>
  .kiaora {
    padding-bottom: 2em;
  }

</style>
