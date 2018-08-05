<template>
  <b-container class="col-md-6 col-lg-5">
    <h1>Register</h1>

    <b-form @submit="onSubmit">

      <b-alert
        :show="!!errorMessage"
        variant="danger"
        dismissible
        @dismissed="errorMessage=undefined">
        {{ errorMessage }}
      </b-alert>

      <b-form-group
        :state="!$v.form.username.$error"
        :invalid-feedback="usernameFeedback"
        label="Username"
        label-for="input-username"
      >
        <b-form-input
          id="input-username"
          v-model="$v.form.username.$model"
          :state="!$v.form.username.$error"
          type="text"
          autofocus
          required
        />
      </b-form-group>

      <b-form-group
        :state="!$v.form.password.$error"
        :invalid-feedback="passwordFeedback"
        label="Password"
        label-for="input-password"
      >
        <b-form-input
          id="input-password"
          v-model="$v.form.password.$model"
          :state="!$v.form.password.$error"
          type="password"/>
      </b-form-group>

      <b-form-group
        :state="!$v.form.passwordConfirm.$error"
        :invalid-feedback="passwordConfirmFeedback"
        label="Retype password"
        label-for="input-password-retype"
      >
        <b-form-input
          v-model="$v.form.passwordConfirm.$model"
          :state="!$v.form.passwordConfirm.$error"
          type="password"/>
      </b-form-group>

      <b-button
        :disabled="$v.form.$invalid"
        type="submit"
        variant="primary">Register
      </b-button>

    </b-form>
  </b-container>
</template>

<script>

import {minLength, required, sameAs} from 'vuelidate/lib/validators';

const validPattern = (value) => /^[a-zA-Z0-9]+(?:[_ -]?[a-zA-Z0-9])*$/.test(value);
const usernameLength = 5;
const passwordLength = 8;

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: 'RegisterView',
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {},
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data() {
    return {
      form: {
        username: '',
        password: '',
        passwordConfirm: '',
      },
      errorMessage: null
    };
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {
    usernameFeedback() {
      if (this.$v.form.username.$invalid) {
        if(!this.$v.form.username.validPattern) {
          return `Must be letters (either case) or numbers`;
        }
        return `Minimum username length is ${usernameLength} characters`;
      }
    },
    passwordFeedback() {
      if (this.$v.form.password.$invalid) {
        return `Minimum password length is ${passwordLength} characters`;
      }
    },
    passwordConfirmFeedback() {
      if (this.$v.form.passwordConfirm.$invalid) {
        return `Must match password`;
      }
    }
  },
  validations: {
    form: {
      username: {
        required,
        minLength: minLength(usernameLength),
        validPattern
      },
      password: {
        required,
        minLength: minLength(passwordLength)
      },
      passwordConfirm: {
        required,
        sameAsPassword: sameAs('password')
      }
    }
  },
  methods: {
    async onSubmit(evt) {
      evt.preventDefault();

      if (!this.$v.$invalid) {
        await this.$store.dispatch('User/REGISTER', {
          username: this.$v.form.username.$model,
          password: this.$v.form.password.$model
        });
      }
    }
  }
};
</script>
