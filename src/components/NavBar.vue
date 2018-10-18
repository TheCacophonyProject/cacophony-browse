<template>
  <div>
    <b-navbar toggleable="lg">
      <b-navbar-brand>
        <router-link
          class="navbar-brand"
          to="/"
          alt="home" />
      </b-navbar-brand>
      <b-navbar-toggle target="navbarToggler"/>
      <b-collapse
        id="navbarToggler"
        is-nav>
        <b-navbar-nav v-if="isLoggedIn">
          <b-nav-item to="/recordings">Recordings</b-nav-item>
          <b-nav-item to="/groups">Groups</b-nav-item>
          <b-nav-item to="/devices">Devices</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav
          v-if="isLoggedIn"
          class="ml-auto">
          <b-nav-text>Hello {{ userName }}</b-nav-text>
          <b-nav-item @click="logout">Logout</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav
          v-if="!isLoggedIn"
          class="ml-auto">
          <b-nav-item to="/login">Login</b-nav-item>
          <b-nav-item to="/register">Register</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      userName: this.$store.state.User.userData.username
    };
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters['User/isLoggedIn'];
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('User/LOGOUT');
      this.$router.go('home');
    }
  }
};
</script>

<style scoped>
  .navbar-brand {
    width: 70%;
  }

  .navbar-brand img {
    width: 100%;
  }

  .navbar-nav .nav-link {
    padding-left: 0.5rem;
  }

  .navbar {
    border-top: solid 12px green;
    border-bottom: solid 1px green;
    margin-bottom: 15px;
  }

  .active {
    background-color: #eeeeee;
    color: #555;
    border-radius: 2px;
  }

  @media only screen and (min-width: 576px) {
    .navbar-brand {
      width: auto;
    }

    .navbar-brand img {
      width: auto;
    }
  }
</style>
