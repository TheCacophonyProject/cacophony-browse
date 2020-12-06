<template>
  <div class="nav-bar">
    <div v-if="isViewingAsOtherUser()" class="super-user-bar">
      <font-awesome-icon icon="glasses" class="icon" />
      <span
        ><strong>{{ superUserName() }}</strong> viewing as
        <strong>{{ userName }}</strong></span
      >
      <a @click="revertViewingUser">
        <font-awesome-icon icon="reply" class="icon" />
        Revert</a
      >
    </div>
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
                v-if="isSuperUser"
                :icon="['fas', 'user-secret']"
                class="icon"
              />
              <font-awesome-icon
                v-else
                :icon="['far', 'user-circle']"
                class="icon"
              />&nbsp;{{ userName }}
            </template>
            <b-dropdown-item
              v-if="isSuperUser"
              @click="showChangeUserViewDialog = true"
            >
              <font-awesome-icon icon="glasses" class="icon" />&nbsp;View user
            </b-dropdown-item>
            <b-dropdown-item @click="logout">
              <font-awesome-icon icon="power-off" class="icon" />&nbsp;Logout
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <b-modal
      v-model="showChangeUserViewDialog"
      @ok="changeViewingUser"
      title="View as another user"
    >
      <b-form-group>
        <label>Select user</label>
        <multiselect
          v-model="selectedUser"
          :options="users"
          :placeholder="usersListLabel"
          :disabled="users.length === 0"
          track-by="id"
          label="name"
        />
      </b-form-group>
    </b-modal>
  </div>
</template>

<script>
import User from "../api/User.api";

export default {
  name: "Navbar",
  data() {
    return {
      internalShowChangeUserViewDialog: false,
      users: [],
      usersListLabel: "loading users",
      selectedUser: {
        name: "",
        id: ""
      }
    };
  },
  computed: {
    userName() {
      return this.$store.state.User.userData.username;
    },
    globalPermission() {
      return this.$store.state.User.userData.globalPermission;
    },
    isSuperUser() {
      return this.globalPermission === "write";
    },
    showChangeUserViewDialog: {
      async set(val) {
        this.internalShowChangeUserViewDialog = val;
        if (this.users.length === 0) {
          await this.initUsersList();
          this.usersListLabel = "select a user";
        }
      },
      get() {
        return this.internalShowChangeUserViewDialog;
      }
    }
  },
  methods: {
    async initUsersList() {
      if (this.isSuperUser) {
        const usersList = await User.list();
        this.users = usersList.result.usersList
          .map(({ username, id }) => ({
            name: username,
            id
          }))
          .filter(({ name }) => name !== this.superUserCreds()?.username);
      }
    },
    superUserName() {
      return this.superUserCreds()?.username;
    },
    logout() {
      this.$store.dispatch("User/LOGOUT");
      this.$router.go("home");
    },
    async changeViewingUser() {
      if (this.selectedUser) {
        // Log in as user:
        const otherUser = await User.loginOther(this.selectedUser.name);
        this.$store.dispatch("User/LOGIN_OTHER", otherUser.result);
        window.location.reload();
      }
    },
    revertViewingUser() {
      const superUser = this.superUserCreds();
      this.$store.dispatch("User/LOGIN_OTHER", {
        userData: { ...superUser },
        token: superUser.token
      });
      this.selectedUse = null;
      window.location.reload();
    },
    superUserCreds() {
      let superUserCreds = localStorage.getItem("superUserCreds");
      if (superUserCreds) {
        try {
          superUserCreds = JSON.parse(superUserCreds);
          return superUserCreds;
        } catch (e) {
          return false;
        }
      }
      return false;
    },
    isViewingAsOtherUser() {
      const superUserCreds = this.superUserCreds();
      return !!(
        superUserCreds &&
        superUserCreds.token &&
        superUserCreds.token !== localStorage.getItem("JWT")
      );
    }
  }
};
</script>

<style scoped lang="scss">
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

.super-user-bar {
  background: purple;
  color: white;
  padding: 5px 10px;
  height: 34px;
  cursor: default;
  user-select: none;
  a,
  a:hover {
    float: right;
    cursor: pointer;
    color: inherit;
    text-decoration: underline;
  }
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
