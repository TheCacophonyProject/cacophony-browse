<template>
  <div>
    <Hero/>
    <b-container>
      <h1>{{ greeting }}</h1>
      <dl>
        <dt>Username</dt>
        <dd id="username"/>
        <dt>First name</dt>
        <dd id="firstname"/>
        <dt>Last name</dt>
        <dd id="lastname"/>
        <dt>Email</dt>
        <dd id="email"/>
        <dt>Your groups</dt>
        <dd id="groups"/>
      </dl>
      <input 
        id="new-group" 
        class="btn btn-secondary" 
        type="button" 
        value="New Group" 
        @click="newGroup" >
    </b-container>
  </div>
</template>

<script>

import Hero from '../components/Hero.vue'

	export default {
		// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
		name:'HomeView',
		components: {
			Hero
		},
		// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
		props:{},
		// https://vuejs.org/v2/style-guide/#Component-data-essential
		data () {
			return {}
		},
		// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
		computed:{
			greeting: function () {
				return "Kia ora " + this.$store.state.User.userData.username
			}
		},
	}
</script>
