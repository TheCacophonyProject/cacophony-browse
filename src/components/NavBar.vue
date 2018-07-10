<template>

	<nav class="navbar navbar-expand-lg navbar-light bg-light justify-content-between">

		<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
			<span class="navbar-toggler-icon"></span>
		</button>
		<router-link class="navbar-brand" to="/" alt="home">
			<img src="../assets/titlebar.png"/>
		</router-link>
		<div v-if="isLoggedIn" class="collapse navbar-collapse" id="navbarToggler">

			<ul class="navbar-nav mr-auto mt-2 mt-lg-0">
				<li class="nav-item">
					<router-link class="nav-link" to="/audio">Audio</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" to="/audiobait">Audio Bait</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" to="/recordings">Recordings</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" to="/groups">Groups</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" to="/devices">Devices</router-link>
				</li>
			</ul>
			<ul class="navbar-nav mr-auto mt-2 mt-lg-0">
				<li class="nav-item"><span class="nav-link">Hello {{userName}}</span></li>
				<li class="nav-item"><a class="nav-link" v-on:click="logout">Logout</a></li>
			</ul>
		</div>
		<div v-if="!isLoggedIn" class="collapse navbar-collapse" id="navbarToggler">{{userName}}
			<ul class="navbar-nav mr-auto mt-2 mt-lg-0">
				<li class="nav-item">
					<router-link class="nav-link" to="/login">Login</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" to="/register">Register</router-link>
				</li>
			</ul>
		</div>

	</nav>
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
	}
</style>
