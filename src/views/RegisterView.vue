<template>
  <b-container class="sign-wrapper">
    <b-form-row class="align-items-center justify-content-center">
      <div class="sign-form-wrapper bg-white rounded">
        <div class="logo" />

        <h1 class="text-center">Register</h1>

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
            :state="!$v.form.email.$error"
            label="Email"
            label-for="input-email"
          >
            <b-form-input
              id="input-email"
              v-model="$v.form.email.$model"
              :state="!$v.form.email.$error"
              type="email"
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
              type="password"
            />
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
              type="password"
            />
          </b-form-group>

          <b-form-group
            label="EndUserAgreement"
            label-class="sr-only"
            label-for="input-end-user-agreement"
          >
            <b-form-checkbox
              id="input-end-user-agreement"
              v-model="$v.form.endUserAgreement.$model"
              value="accepted"
              unchecked-value="not-accepted"
            >
              I agree to the terms of the
              <a
                target="_blank"
                href="https://www.2040.co.nz/pages/2040-end-user-agreement"
              >
                end user agreement
              </a>
            </b-form-checkbox>
          </b-form-group>

          <b-button
            :disabled="$v.form.$invalid"
            type="submit"
            class="btn-block"
            variant="primary"
            >Register
          </b-button>

          <p class="small mt-4 text-center">
            Already registered? <b-link href="/login">Login here</b-link>.
          </p>
        </b-form>
      </div>
    </b-form-row>
  </b-container>
</template>

<script>
import { minLength, required, sameAs } from "vuelidate/lib/validators";

const validPattern = value =>
  /^[a-zA-Z0-9]+(?:[_ -]?[a-zA-Z0-9])*$/.test(value);
const usernameLength = 5;
const passwordLength = 8;

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: "RegisterView",
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {},
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data() {
    return {
      form: {
        username: "",
        email: "",
        password: "",
        passwordConfirm: "",
        endUserAgreement: "not-accepted"
      },
      errorMessage: null
    };
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {
    usernameFeedback() {
      if (this.$v.form.username.$invalid) {
        if (!this.$v.form.username.validPattern) {
          return `Must be letters (either case) or numbers`;
        }
        return `Minimum username length is ${usernameLength} characters`;
      }
      return null;
    },
    passwordFeedback() {
      if (this.$v.form.password.$invalid) {
        return `Minimum password length is ${passwordLength} characters`;
      }
      return null;
    },
    passwordConfirmFeedback() {
      if (this.$v.form.passwordConfirm.$invalid) {
        return `Must match password`;
      }
      return null;
    }
  },
  validations: {
    form: {
      username: {
        required,
        minLength: minLength(usernameLength),
        validPattern
      },
      email: {
        required
      },
      password: {
        required,
        minLength: minLength(passwordLength)
      },
      passwordConfirm: {
        required,
        sameAsPassword: sameAs("password")
      },
      endUserAgreement: {
        value: value => value == "accepted"
      }
    }
  },
  methods: {
    async onSubmit(evt) {
      evt.preventDefault();

      if (!this.$v.$invalid) {
        await this.$store.dispatch("User/REGISTER", {
          username: this.$v.form.username.$model,
          password: this.$v.form.password.$model,
          email: this.$v.form.email.$model
        });
        if (this.$store.getters["User/isLoggedIn"]) {
          this.$router.push("/");
        }
      }
    }
  }
};
</script>

<style scoped>
.sign-form-wrapper {
  max-width: 460px;
}
</style>
