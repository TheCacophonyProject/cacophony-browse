<template>
  <div>
    <hero/>
    <b-container class="col-md-6 col-lg-5">
      <h1>Login</h1>

      <b-form @submit="onSubmit">
        <b-alert
          :show="!!errorMessage"
          variant="danger"
          dismissible
          @dismissed="errorMessage=undefined">
          {{ errorMessage }}
        </b-alert>

        <b-form-group
          label="Username Or Email"
          label-for="input-username-or-email">
          <b-form-input
            id="input-username-or-email"
            v-model="usernameOrEmail"
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
          variant="primary">Sign in
        </b-button>

      </b-form>

    </b-container>
  </div>
</template>

<script>

import Hero from '../components/Hero.vue';

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'LoginView',
  components: { Hero },
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {},
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data() {
    return {
      usernameOrEmail: '',
      password: '',
      errorMessage: null
    };
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {},
  methods: {
    async onSubmit(evt) {
      evt.preventDefault();

      if (this.usernameOrEmail && this.password) {
        await this.$store.dispatch('User/LOGIN', {
          username: this.usernameOrEmail,
          password: this.password
        });

        if(this.$store.getters['User/isLoggedIn']) {
          this.$router.go('home');
        }

      } else {
        this.errorMessage = "Username/Email & password are required";
        setTimeout(() => {
          return this.errorMessage = false;
        }, 3000);
      }
    }
  }
};

</script>
