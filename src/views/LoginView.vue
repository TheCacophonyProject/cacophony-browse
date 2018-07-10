<template>
	<div>
		<h1>Login</h1>

		<b-form @submit="onSubmit">

			<b-form-group
				label="Username"
				label-for="input-username">
				<b-form-input type="text" id="input-username" v-model="username"></b-form-input>
			</b-form-group>

			<b-form-group
					label="Password"
					label-for="input-password">
				<b-form-input type="password" id="input-password" v-model="password"></b-form-input>
			</b-form-group>

			<b-button type="submit" variant="primary">Sign in</b-button>

		</b-form>

	</div>
</template>

<script>


	export default {
		// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
		name:'login-view',
		// https://vuejs.org/v2/style-guide/#Component-data-essential
		data () {
			return {
				username: '',
				password: ''
			}
		},
		// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
		computed:{},
		// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
		props:{},
		methods:{
			onSubmit (evt) {
				evt.preventDefault();
				this.$store.dispatch('User/LOGIN', {
					username: this.username,
					password: this.password
				}).then(() => {
					this.$router.go('home')
				})

			}
		}
	}


</script>
