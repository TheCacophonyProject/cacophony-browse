<template>
  <b-modal
    id="group-add-user"
    title="Add user to group"
    @ok="addUser"
    @shown="setFocusAndReset"
    ok-title="Add"
    :ok-disabled="isDisabled"
  >
    <b-form @submit="addUser">
      <b-form-group label-for="input-username" label="Username">
        <b-form-input
          ref="input-username"
          id="input-username"
          @update="resetFormSubmission"
          v-model="$v.form.username.$model"
          :state="usernameState"
          aria-describedby="username-live-help username-live-feedback"
          type="text"
          autofocus
          class="input"
        ></b-form-input>

        <b-form-invalid-feedback id="username-live-feedback">
          This username couldn't be found.
        </b-form-invalid-feedback>

        <b-form-text id="username-live-help"
          >Users can view recordings for the devices associated with this
          group.</b-form-text
        >
      </b-form-group>

      <b-form-group>
        <b-form-checkbox
          id="input-user-admin"
          v-model="$v.form.isAdmin.$model"
          plain
          value="true"
          unchecked-value="false"
        >
          Make this user an administrator
        </b-form-checkbox>
        <b-form-text id="input-user-admin-help">
          Administrators can add and remove users from this group.
        </b-form-text>
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import { required } from "vuelidate/lib/validators";

const initialFormState = {
  username: null,
  isAdmin: false
};
export default {
  name: "GroupUserAdd",
  props: {
    group: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      form: { ...initialFormState },
      formSubmissionFailed: false
    };
  },
  computed: {
    usernameIsEmpty() {
      return (
        this.$v.form.username.$model === null ||
        this.$v.form.username.$model === ""
      );
    },
    usernameState() {
      if (this.usernameIsEmpty) {
        return null;
      }
      if (this.formSubmissionFailed) {
        return false;
      }
      return !this.$v.form.username.$error;
    },
    isDisabled() {
      return this.usernameIsEmpty;
    }
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
    resetFormSubmission() {
      this.formSubmissionFailed = false;
    },
    addUser: async function(event) {
      event.preventDefault();

      if (!this.$v.$invalid) {
        const params = {
          userName: this.$v.form.username.$model,
          isAdmin: this.$v.form.isAdmin.$model,
          groupName: this.group.groupname
        };

        const result = await this.$store.dispatch(
          "Groups/ADD_GROUP_USER",
          params
        );

        if (result === false) {
          this.formSubmissionFailed = true;
        }
      }
    },
    setFocusAndReset() {
      this.form = { ...initialFormState };
      this.$refs["input-username"].focus();
    }
  }
};
</script>
