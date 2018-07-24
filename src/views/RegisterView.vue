<template>
  <b-container class="col-md-6 col-lg-5">
    <h1>Register</h1>

    <b-form @submit="onSubmit">

      <b-form-group
        :state="usernameState"
        :invalid-feedback="invalidUsername"
        label="Username"
        label-for="input-username"
      >
        <b-form-input
          id="input-username"
          v-model="username"
          :state="usernameState"
          type="text"
          autofocus
        />
      </b-form-group>

      <b-form-group
        :state="passwordState"
        :invalid-feedback="invalidPassword"
        label="Password"
        label-for="input-password"
      >
        <b-form-input
          v-model="password"
          :state="passwordState"
          type="password"/>
      </b-form-group>

      <b-form-group
        :state="retypeState"
        :invalid-feedback="invalidRetype"
        label="Retype password"
        label-for="input-password-retype">
        <b-form-input
          v-model="passwordRetype"
          :state="retypeState"
          type="password"/>
      </b-form-group>

      <b-button 
        type="submit" 
        variant="primary">Register</b-button>

    </b-form>
  </b-container>
</template>

<script>

const usernamePattern = /^[a-zA-Z0-9]+(?:[_ -]?[a-zA-Z0-9])*$/;
const usernameLength = 5;
const passwordLength = 8;

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'RegisterView',
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {},
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data () {
    return {
      username: '',
      password: '',
      passwordRetype: ''
    };
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {
    usernameState () {
      if (this.username.length === 0) {
        // Empty field
        return null;
      } else {
        // Username length requirement is made up... need to check API for actual requirement
        return usernamePattern.test(this.username) && this.username.length > usernameLength;
      }
    },
    invalidUsername () {
      if (this.username.length <= usernameLength) {
        return "Not long enough";
      } else {
        return "Only letters and numbers";
      }
    },
    passwordState () {
      if (this.password.length === 0) {
        // Empty field
        return null;
      } else {
        return this.password.length > passwordLength;
      }
    },
    invalidPassword () {
      return "Not long enough";
    },
    retypeState () {
      if (this.passwordRetype.length === 0) {
        // Empty field
        return null;
      } else {
        return this.password === this.passwordRetype;
      }
    },
    invalidRetype () {
      return "Must match";
    }
  },
  methods: {
    onSubmit (evt) {
      evt.preventDefault();
      if (this.usernameState && this.passwordState && this.retypeState) {
        this.$store.dispatch('User/REGISTER', {
          username: this.username,
          password: this.password
        }).then(() => {
          this.$router.push('/');
        });
      } else {
				console.log("invalid form") //eslint-disable-line
      }
    }
  }
};
</script>
