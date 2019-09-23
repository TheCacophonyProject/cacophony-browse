<template>
  <div>
    <hero />
    <b-container class="col-md-6 col-lg-5">
      <h1>Add Email</h1>

      <b-form @submit="onSubmit">
        <b-alert
          :show="!!errorMessage"
          variant="danger"
          dismissible
          @dismissed="errorMessage = undefined"
        >
          {{ errorMessage }}
        </b-alert>

        <b-form-group label="Email" label-for="input-email">
          <b-form-input id="input-email" v-model="email" type="email" />
        </b-form-group>

        <b-button type="submit" variant="primary">Save Email </b-button>
      </b-form>
    </b-container>
  </div>
</template>

<script>
import Hero from "../components/Hero.vue";

export default {
  // https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential
  name: "AddEmailView",
  components: { Hero },
  // https://vuejs.org/v2/style-guide/#Prop-definitions-essential
  props: {},
  // https://vuejs.org/v2/style-guide/#Component-data-essential
  data() {
    return {
      email: "",
      errorMessage: null
    };
  },
  // https://vuejs.org/v2/style-guide/#Simple-computed-properties-strongly-recommended
  computed: {},
  methods: {
    async onSubmit(evt) {
      evt.preventDefault();
      if (!this.email) {
        this.errorMessage = "Email required";
        return;
      }
      var result = await this.$store.dispatch("User/UPDATE", {
        email: this.email
      });
      if (result) {
        this.$router.push("/");
      }
    }
  }
};
</script>
