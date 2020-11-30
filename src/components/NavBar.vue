<template>
  <div class="nav-bar">
    <b-navbar toggleable="lg">
      <b-navbar-brand>
        <router-link class="navbar-brand" to="/" alt="home" />
      </b-navbar-brand>

      <b-navbar-toggle target="navbarToggler" />

      <b-collapse id="navbarToggler" is-nav>
        <b-navbar-nav>
          <b-nav-item to="/visits">Visits</b-nav-item>
          <b-nav-item to="/analysis">Analysis</b-nav-item>
          <b-nav-item to="/recordings">Recordings</b-nav-item>
          <b-nav-item to="/tagging">Power Tagger</b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown>
            <template slot="button-content">
              <font-awesome-icon icon="wrench" class="icon" />&nbsp;Admin
            </template>
            <b-dropdown-item href="/groups"
              ><font-awesome-icon
                icon="users"
                class="icon"
              />&nbsp;Groups</b-dropdown-item
            >
            <b-dropdown-item href="/devices"
              ><font-awesome-icon
                icon="microchip"
                class="icon"
              />&nbsp;Devices</b-dropdown-item
            >
          </b-nav-item-dropdown>
          <b-nav-item-dropdown class="profile">
            <template slot="button-content">
              <font-awesome-icon
                :icon="['far', 'user-circle']"
                class="icon"
              />&nbsp;{{ userName }}
            </template>
            <b-dropdown-item v-if="isSuperUser" @click="changeViewingUser">
              <font-awesome-icon icon="glasses" class="icon" />&nbsp;View user
            </b-dropdown-item>
            <b-dropdown-item @click="logout">
              <font-awesome-icon icon="power-off" class="icon" />&nbsp;Logout
            </b-dropdown-item>
          </b-nav-item-dropdown>
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
      userName: this.$store.state.User.userData.username,
      globalPermission: this.$store.state.User.userData.globalPermission
    };
  },
  computed: {
    isSuperUser() {
      return this.globalPermission === "write";
    }
  },
  methods: {
    logout() {
      this.$store.dispatch("User/LOGOUT");
      this.$router.go("home");
    },
    changeViewingUser() {
      // TODO(jon): Show a prompt to change which user we're viewing.
      this.$emit("change-viewing-user");
    }
  }
};
</script>

<style scoped>
.navbar {
  border-bottom: solid rgb(222, 226, 230) 1px;
  padding-top: 0px;
  padding-bottom: 0px;
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

.icon {
  width: 1.6em;
  text-align: center;
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
