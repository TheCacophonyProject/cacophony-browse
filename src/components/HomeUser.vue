<template>
  <div>
    <h3>Your details</h3>

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

    </dl>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "HomeUser",
  computed: mapState({
    user: state => state.User,
    username: state => state.User.userData.username,
    firstname: state => state.User.userData.firstname,
    lastname: state => state.User.userData.lastname,
    email: state => state.User.userData.email
  })
};
</script>

<style scoped>
</style>
