<template>
  <b-container class="sign-wrapper">
    <b-form-row class="align-items-center justify-content-center">
      <div class="sign-form-wrapper bg-white rounded text-center">
        <div class="logo" />

        <h1>End User Agreement</h1>

        <b-form @submit="onSubmit">
          <b-alert
            :show="!!errorMessage"
            variant="danger"
            dismissible
            @dismissed="errorMessage = undefined"
          >
            {{ errorMessage }}
          </b-alert>

          <p>
            The end user agreement has been updated. Please accept the new end
            user agreement.
          </p>

          <b-form-group
            label="EndUserAgreement"
            label-class="sr-only"
            label-for="input-end-user-agreement"
          >
            <b-form-checkbox
              id="input-end-user-agreement"
              v-model="inputEndUserAgreement"
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
            :disabled="inputEndUserAgreement != 'accepted'"
            type="submit"
            variant="primary"
            class="btn-block"
            >Continue
          </b-button>
        </b-form>
      </div>
    </b-form-row>
  </b-container>
</template>

<script>
export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: "AcceptEndUserAgreementView",
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {},
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data() {
    return {
      inputEndUserAgreement: "not-accepted",
      errorMessage: null
    };
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {},
  methods: {
    async onSubmit(evt) {
      evt.preventDefault();
      await this.$store.dispatch("User/ACCEPT_END_USER_AGREEMENT");
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
