<template>
	<div>
		<Hero/>
		<b-container>
			<h1>{{ greeting }}</h1>
			<dl>
				<dt>Username</dt>
				<dd id="username"></dd>
				<dt>First name</dt>
				<dd id="firstname"></dd>
				<dt>Last name</dt>
				<dd id="lastname"></dd>
				<dt>Email</dt>
				<dd id="email"></dd>
				<dt>Your groups</dt>
				<dd id="groups"></dd>
			</dl>
			<input class="btn btn-secondary" id="new-group" type="button" value="New Group" v-on:click="newGroup" />
		</b-container>
	</div>
</template>

<script>

import Hero from '../components/Hero.vue'

	export default {
		// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
		name:'home-view',
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
		// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
		props:{},
		components: {
			Hero
		}
	}
</script>
