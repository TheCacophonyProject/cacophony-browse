<template>
  <b-container class="sign-wrapper">
    <b-form-row class="align-items-center justify-content-center">
      <div class="sign-form-wrapper bg-white rounded text-center">
        <div class="logo" />

        <h1>Login</h1>

        <b-form @submit="onSubmit">
          <b-alert
            :show="!!errorMessage"
            variant="danger"
            dismissible
            @dismissed="errorMessage = undefined"
          >
            {{ errorMessage }}
          </b-alert>

          <b-form-group
            label="Username or Email"
            label-class="sr-only"
            label-for="input-username-or-email"
          >
            <b-form-input
              id="input-username-or-email"
              v-model="usernameOrEmail"
              placeholder="Username or Email Address"
              type="text"
            />
          </b-form-group>

          <b-form-group
            label="Password"
            label-class="sr-only"
            label-for="input-password"
          >
            <b-form-input
              id="input-password"
              v-model="password"
              placeholder="Password"
              type="password"
            />
          </b-form-group>

          <b-button
            :disabled="usernameOrEmail === '' || password === ''"
            type="submit"
            variant="primary"
            class="btn-block"
            >Sign in
          </b-button>

          <p class="small mt-4">
            Don't have an account yet?
            <b-link href="/register">Register here</b-link>.
          </p>
        </b-form>
      </div>
    </b-form-row>
  </b-container>
</template>

<script>
export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: "LoginView",
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {},
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data() {
    return {
      usernameOrEmail: "",
      password: "",
      errorMessage: null
    };
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {},
  methods: {
    async onSubmit(evt) {
      evt.preventDefault();

      await this.$store.dispatch("User/LOGIN", {
        username: this.usernameOrEmail,
        password: this.password
      });

      if (this.$store.getters["User/isLoggedIn"]) {
        this.$router.go("home");
      }
    }
  }
};
</script>

<style scoped>
.sign-form-wrapper {
  max-width: 360px;
}
</style>
