<template>
  <div id="app">
    <global-messaging/>
    <nav-bar v-if="isLoggedIn()"/>
    <router-view class="view"/>
  </div>
</template>

<script>
import store from './stores';
import NavBar from './components/NavBar.vue';
import GlobalMessaging from './components/GlobalMessaging.vue';

export default {
  name: 'App',
  components: {
    NavBar,
    GlobalMessaging
  },
  methods: {
    isLoggedIn: function() {
      return store.getters['User/isLoggedIn'];
    }
  }
};
</script>
