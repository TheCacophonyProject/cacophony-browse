<template>
	<b-container>
		<h1>Register</h1>

		<b-form @submit="onSubmit">

			<b-form-group
				label="Username"
				label-for="input-username"
				v-bind:state="usernameState"
				v-bind:invalid-feedback="invalidUsername"
			>
				<b-form-input
					id="input-username"
					type="text"
					v-model="username"
					autofocus
					v-bind:state="usernameState"
				></b-form-input>
			</b-form-group>

			<b-form-group
					label="Password"
					label-for="input-password"
					v-bind:state="passwordState"
					v-bind:invalid-feedback="invalidPassword"
					>
				<b-form-input
					type="password"
					v-model="password"
					v-bind:state="passwordState"></b-form-input>
			</b-form-group>

			<b-form-group
					label="Retype password"
					label-for="input-password-retype"
					v-bind:state="retypeState"
					v-bind:invalid-feedback="invalidRetype">
				<b-form-input
					type="password"
					v-model="passwordRetype"
					v-bind:state="retypeState"></b-form-input>
			</b-form-group>

			<b-button type="submit" variant="primary">Register</b-button>

		</b-form>
	</b-container>
</template>

<script>

let usernamePattern = /^[a-zA-Z0-9]+(?:[_ -]?[a-zA-Z0-9])*$/;
let usernameLength = 5;
let passwordLength = 8;

export default {
	// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
	name: 'register-view',
	// https://vuejs.org/v2/style-guide/#Component-data-essential
	data () {
		return {
			username: '',
			password: '',
			passwordRetype: ''
		}
	},
	// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
	computed: {
		usernameState () {
			if (this.username.length === 0) {
				// Empty field
				return null
			} else {
				// Username length requirement is made up... need to check API for actual requirement
				return usernamePattern.test(this.username) && this.username.length > usernameLength
			}
		},
		invalidUsername () {
			if (this.username.length <= usernameLength) {
				return "Not long enough"
			} else {
				return "Only letters and numbers"
			}
		},
		passwordState () {
			if (this.password.length === 0) {
				// Empty field
				return null
			} else {
				return this.password.length > passwordLength
			}
		},
		invalidPassword () {
			return "Not long enough"
		},
		retypeState () {
			if (this.passwordRetype.length === 0) {
				// Empty field
				return null
			} else {
				return this.password === this.passwordRetype
			}
		},
		invalidRetype () {
			return "Must match"
		}
	},
	// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
	props: {},
	methods: {
		onSubmit (evt) {
			evt.preventDefault();
			if (this.usernameState && this.passwordState && this.retypeState) {
				this.$store.dispatch('User/REGISTER', {
					username: this.username,
					password: this.password
				}).then(() => {
					this.$router.push('/')
				})
			} else {
				console.log("invalid form") //eslint-disable-line
			}
		}
	}
}
</script>
