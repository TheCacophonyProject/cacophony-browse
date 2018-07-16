<template>
  <div id="app">
    <navbar/>
    <router-view class="view"/>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
export default {
  name:'App',
  components:{'navbar':NavBar},
  data () {
    return {
      msg:'Cacophony'
    };
  }
};
</script>
