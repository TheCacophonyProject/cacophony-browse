<template>
  <div id="app">
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
    // TODO(jon): Should fetch users into users data.  This will require an API update to be able to list users.

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
    isLoggedIn: function() {
      return store.getters["User/isLoggedIn"];
    },
    changeUserView() {
      this.showChangeUserViewDialog = true;
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

        // Save super-user creds to another localStorage location.

        User.persistUser(
          username,
          token,
          email,
          globalPermission,
          id,
          acceptedEUA
        );
        // Save the JWT token as our token, and move the admin user settings into some other local storage?
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
