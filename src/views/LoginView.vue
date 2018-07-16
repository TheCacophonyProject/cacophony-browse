<template>
  <div>
    <Hero />
    <b-container class="col-md-6 col-lg-5">
      <h1>Login</h1>

      <b-form @submit="onSubmit">

        <b-form-group
          label="Username"
          label-for="input-username">
          <b-form-input 
            id="input-username" 
            v-model="username" 
            type="text"/>
        </b-form-group>

        <b-form-group
          label="Password"
          label-for="input-password">
          <b-form-input 
            id="input-password" 
            v-model="password" 
            type="password"/>
        </b-form-group>

        <b-button 
          type="submit" 
          variant="primary">Sign in</b-button>

      </b-form>

    </b-container>
  </div>
</template>

<script>

import Hero from '../components/Hero.vue'

	export default {
		// https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
		name:'LoginView',
		components: {
			"Hero": Hero
		},
		// https://vuejs.org/v2/style-guide/#Prop-definitions-essential
		props:{},
		// https://vuejs.org/v2/style-guide/#Component-data-essential
		data () {
			return {
				username: '',
				password: ''
			}
		},
		// https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
		computed:{},
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
		},
	}


</script>
