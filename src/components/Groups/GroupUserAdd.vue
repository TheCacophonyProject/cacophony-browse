<template>
  <b-card bg-variant="light">

    <b-form
      inline
      class="add-user-form"
      @submit="addUser">

      <b-input
        id="input-groupname"
        :state="!$v.form.username.$error"
        v-model="$v.form.username.$model"
        aria-describedby="input1LiveFeedback"
        type="text"
        autofocus
        placeholder="User Id"
        class="input"
      />

      <div class="options">
        <b-form-checkbox
          v-model="$v.form.isAdmin.$model"
          plain
          value="true"
          unchecked-value="false">
          Admin?
        </b-form-checkbox>

        <b-button
          :disabled="$v.form.$invalid"
          type="submit"
          variant="primary">
          Add Group User
        </b-button>
      </div>
    </b-form>

  </b-card>
</template>

<script>
import {required} from 'vuelidate/lib/validators';

export default {
  name: 'GroupUserAdd',
  props: {
    group: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      form: {
        username: null,
        isAdmin: false
      }
    };
  },
  computed: {
    usernameInvalidFeedback() {
      if (this.$v.form.username.$invalid) {
        return `Username is required`;
      }
    },
  },
  validations: {
    form: {
      username: {
        required
      },
      isAdmin: {}
    }
  },
  methods: {
    addUser: function (event) {
      event.preventDefault();

      if (!this.$v.$invalid) {

        const params = {
          userName: this.$v.form.username.$model,
          isAdmin: this.$v.form.isAdmin.$model,
          groupId: this.group.id
        };

        this.$store.dispatch('Groups/ADD_GROUP_USER', params);
      }

    }
  }
};
</script>

<style>
  .add-user-form {
    flex-wrap: wrap;
  }

  .input {
    width: 100%;
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .options {
    flex-direction: row;
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  @media only screen and (min-width: 576px) {
    .add-user-form {
      flex-wrap: nowrap;
      justify-content: space-evenly;
    }

    .input {
      width: auto;
      margin-right: 1rem;
      margin-bottom: 0;
    }

    .options {
      flex-direction: row;
      display: flex;
      justify-content: space-between;
      width: auto;
    }
  }
</style>
