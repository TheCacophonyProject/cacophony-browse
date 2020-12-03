<template>
  <div id="app">
    <div v-if="isLoggedIn() && isViewingAsOtherUser()">
      Viewing as {{ superUserName }}
    </div>
    <global-messaging />
    <nav-bar v-if="isLoggedIn()" @change-viewing-user="changeUserView" />
    <router-view class="view" />
    <b-modal v-model="showChangeUserViewDialog" @ok="changeViewingUser">
      <b-form-group>
        <label>Select user</label>
        <multiselect
          v-model="selectedUser"
          :options="users"
          placeholder="select a user"
          :disabled="users.length === 0"
          track-by="id"
          label="name"
        />
      </b-form-group>
    </b-modal>
  </div>
</template>

<script>
import store from "./stores";
import NavBar from "./components/NavBar.vue";
import User from "./api/User.api";
import GlobalMessaging from "./components/GlobalMessaging.vue";

export default {
  name: "App",
  data() {
    return {
      showChangeUserViewDialog: false,
      users: [
        { id: "Bob", name: "Bob" },
        { id: "sally", name: "Sally" },
        { id: "trevor", name: "Trevor" }
      ],
      selectedUser: null // View user starts out as the super user.
    };
  },
  async created() {
    // Should grab locally persisted shadow user if there is one.
    this.selectedUser = {
      id: Number(localStorage.getItem("userId")),
      name: localStorage.getItem("username")
    };

    // Check if we are admin
    const usersList = await User.list();
    this.users = usersList.result.usersList.map(({ username, id }) => ({
      name: username,
      id
    }));
  },
  components: {
    NavBar,
    GlobalMessaging
  },

  methods: {
    isLoggedIn() {
      return store.getters["User/isLoggedIn"];
    },

    superUserName() {
      return this.superUserCreds()?.username;
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
    changeUserView() {
      this.showChangeUserViewDialog = true;
    },
    isViewingAsOtherUser() {
      const superUserCreds = this.superUserCreds();
      if (
        superUserCreds &&
        superUserCreds.token &&
        superUserCreds.token !== localStorage.getItem("JWT")
      ) {
        return true;
      }
      return false;
    },
    async changeViewingUser() {
      if (this.selectedUser) {
        // Log in as user:
        const otherUser = await User.loginOther(this.selectedUser.name);
        const token = otherUser.result.token;
        const {
          username,
          globalPermission,
          acceptedEUA,
          email,
          id
        } = otherUser.result.userData;
        User.persistUser(
          username,
          token,
          email,
          globalPermission,
          id,
          acceptedEUA
        );
      }
    }
  }
};
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  --navbar-height: 65px;

  text-rendering: optimizeLegibility;
  font-feature-settings: "kern" 1;
  -moz-font-feature-settings: "kern";
  -moz-font-feature-settings: "kern=1";
  font-kerning: normal;
}
.view {
  flex-grow: 1;
}
</style>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
