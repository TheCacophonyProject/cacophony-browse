<template>
  <div id="app" :class="{ 'viewing-as-admin': isViewingAsOtherUser() }">
    <global-messaging />
    <nav-bar v-if="isLoggedIn" />
    <router-view class="view" />
  </div>
</template>

<script>
import store from "./stores";
import NavBar from "./components/NavBar.vue";
import GlobalMessaging from "./components/GlobalMessaging.vue";

export default {
  name: "App",
  components: {
    NavBar,
    GlobalMessaging
  },
  computed: {
    isLoggedIn() {
      return store.getters["User/isLoggedIn"];
    }
  },
  methods: {
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

<style lang="scss">
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  --navbar-height: 65px;
  &.viewing-as-admin {
    --navbar-height: 99px;
  }

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
