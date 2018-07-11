<template>
	<div>
		<b-navbar toggleable="lg">
			<b-navbar-brand>
				<router-link class="navbar-brand" to="/" alt="home">
					<img src="../assets/titlebar.png"/>
				</router-link>
			</b-navbar-brand>
			<b-navbar-toggle target="navbarToggler"></b-navbar-toggle>
			<b-collapse is-nav id="navbarToggler">
				<b-navbar-nav v-if="isLoggedIn">
					<b-nav-item to="/audio">Audio</b-nav-item>
					<b-nav-item to="/audiobait">Audio Bait</b-nav-item>
					<b-nav-item to="/recordings">Recordings</b-nav-item>
					<b-nav-item to="/groups">Groups</b-nav-item>
					<b-nav-item to="/devices">Devices</b-nav-item>
				</b-navbar-nav>
				<b-navbar-nav class="ml-auto" v-if="isLoggedIn">
					<b-nav-text>Hello {{userName}}</b-nav-text>
					<b-nav-item v-on:click="logout">Logout</b-nav-item>
				</b-navbar-nav>
				<b-navbar-nav class="ml-auto" v-if="!isLoggedIn">
					<b-nav-item to="/login">Login</b-nav-item>
					<b-nav-item to="/register">Register</b-nav-item>
				</b-navbar-nav>
			</b-collapse>
		</b-navbar>
	</div>
</template>

<script>
	export default {
		// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
		name:'navbar',
		// https://vuejs.org/v2/style-guide/#Component-data-essential
		data () {
			return {
				userName:this.$store.state.User.userData.username
			}
		},
		// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
		computed:{
			isLoggedIn() {
				return this.$store.getters['User/isLoggedIn']
			}
		},
		// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
		props:{},
		methods: {
			logout () {
				this.$store.dispatch('User/LOGOUT')
				this.$router.go('home')
			}
		}
	}
</script>

<style>
	.navbar {
		border-top: solid 12px green;
		border-bottom: solid 1px green;
		margin-bottom: 15px;
	}

	.active {
  background-color: #e7e7e7;
  color: #555;
}
</style>
