<template>
  <div id="app">
    <global-messaging />
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
