<template>
  <b-modal
    id="group-user-add"
    title="Add user to group"
    @ok="addUser"
    @shown="setFocusAndReset"
    ok-title="Add"
    :ok-disabled="isDisabled"
  >
    <b-form @submit="addUser" data-cy="add-user-form">
      <b-form-group label-for="input-username" label="Username">
        <b-form-input
          ref="input-username"
          id="input-username"
          @update="resetFormSubmission"
          v-model.trim="$v.form.username.$model"
          :state="usernameState"
          aria-describedby="username-live-help username-live-feedback"
          type="text"
          autofocus
          class="input"
          data-cy="user-name-input"
        />

        <b-form-invalid-feedback id="username-live-feedback">
          This username couldn't be found.
        </b-form-invalid-feedback>

        <b-form-text id="username-live-help">
          Users can view recordings for the devices associated with this group.
        </b-form-text>
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
import api from "@/api";

const initialFormState = {
  username: null,
  isAdmin: false,
};

export default {
  name: "GroupStationAdd",
  props: {
    group: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      form: { ...initialFormState },
      formSubmissionFailed: false,
    };
  },
  computed: {
    usernameIsEmpty() {
      return (
        this.$v.form.username.$model === null ||
        this.$v.form.username.$model.trim() === ""
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
    },
  },
  validations: {
    form: {
      username: {
        required,
      },
      isAdmin: {},
    },
  },
  methods: {
    resetFormSubmission() {
      this.formSubmissionFailed = false;
    },
    addUser: async function (event) {
      event.preventDefault();
      if (!this.$v.$invalid) {
        const result = await api.groups.addGroupUser(
          this.group.groupname,
          this.form.username,
          this.form.isAdmin
        );
        if (!result.success) {
          this.formSubmissionFailed = true;
        } else {
          // We can emit that a user was added to the group:
          this.$bvModal.hide("group-user-add");
          this.$emit("user-added-to-group");
        }
      }
    },
    setFocusAndReset() {
      this.form = { ...initialFormState };
      this.$refs["input-username"].focus();
    },
  },
};
</script>
