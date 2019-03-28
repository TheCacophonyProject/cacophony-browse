<template>
  <div id="app">
    <global-messaging/>
    <nav-bar/>
    <router-view class="view"/>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
import GlobalMessaging from './components/GlobalMessaging.vue';

export default {
  name: 'App',
  components: {
    NavBar,
    GlobalMessaging
  }
};
</script>

<style>
  #app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    max-height: 100vh;
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
