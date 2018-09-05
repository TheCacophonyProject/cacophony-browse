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
        placeholder="User Id"
        autofocus
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
          :disabled="$v.form.$invalid || !fetched"
          type="submit"
          variant="primary">
          Add Device User
        </b-button>
      </div>
    </b-form>

  </b-card>
</template>

<script>
import {required} from 'vuelidate/lib/validators';
import {mapState} from 'vuex';

export default {
  name: "DeviceAddUser",
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
    ...mapState({
      device: state => state.Devices.currentDevice,
      fetched: state => state.Devices.fetched
    })
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
    async addUser(event) {
      event.preventDefault();

      if (!this.$v.$invalid) {

        const params = {
          username: this.$v.form.username.$model,
          device: this.device,
          admin: this.$v.form.isAdmin.$model
        };

        await this.$store.dispatch('Devices/ADD_USER', params);
      }
    }
  }
};
</script>

<style scoped>
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
      justify-content: space-around;
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
