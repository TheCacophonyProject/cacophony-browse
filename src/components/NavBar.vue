<template>
  <div class="nav-bar">
    <b-navbar toggleable="lg">
      <b-navbar-brand>
        <router-link class="navbar-brand" to="/" alt="home" />
      </b-navbar-brand>

      <b-navbar-toggle target="navbarToggler" />

      <b-collapse id="navbarToggler" is-nav>
        <b-navbar-nav v-if="isLoggedIn">
          <b-nav-item to="/analysis">Analysis</b-nav-item>
          <b-nav-item to="/recordings">Recordings</b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav v-if="isLoggedIn" class="ml-auto">
          <b-nav-item-dropdown>
            <template slot="button-content">
              <font-awesome-icon icon="wrench" />&nbsp;Admin
            </template>
            <b-dropdown-item href="/groups"
              ><font-awesome-icon icon="users" />&nbsp;Groups</b-dropdown-item
            >
            <b-dropdown-item href="/devices"
              ><font-awesome-icon
                icon="microchip"
              />&nbsp;Devices</b-dropdown-item
            >
          </b-nav-item-dropdown>

          <b-nav-item-dropdown class="profile">
            <template slot="button-content">
              <font-awesome-icon :icon="['far', 'user-circle']" />&nbsp;{{
                userName
              }}
            </template>
            <b-dropdown-item @click="logout"
              ><font-awesome-icon
                icon="power-off"
              />&nbsp;Logout</b-dropdown-item
            >
          </b-nav-item-dropdown>
        </b-navbar-nav>

        <b-navbar-nav v-if="!isLoggedIn" class="ml-auto">
          <b-nav-item to="/login">Login</b-nav-item>
          <b-nav-item to="/register">Register</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
export default {
  name: "Navbar",
  data() {
    return {
      userName: this.$store.state.User.userData.username
    };
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters["User/isLoggedIn"];
    }
  },
  methods: {
    logout() {
      this.$store.dispatch("User/LOGOUT");
      this.$router.go("home");
    }
  }
};
</script>

<style scoped>
.navbar {
  border-bottom: solid rgb(222, 226, 230) 1px;
  padding-top: 0px;
  padding-bottom: 0px;
  color: black;
}

.navbar-brand {
  width: 70%;
}

.navbar-brand img {
  width: 100%;
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

  .profile {
    border-left: solid rgb(222, 226, 230) 1px;
  }
}
</style>
