<template>
  <b-modal
    id="group-add"
    title="Create group"
    ok-title="Create"
    @shown="reset"
    @ok="addNewGroup"
    :ok-disabled="isDisabled"
  >
    <b-form @submit="addNewGroup">
      <b-form-group
        :state="groupState"
        :invalid-feedback="groupNameInvalidFeedback"
        label-for="input-groupname"
        label="Group name"
      >
        <b-form-input
          ref="input-groupname"
          id="input-groupname"
          :state="groupState"
          @update="resetFormSubmission"
          v-model="$v.form.groupName.$model"
          type="text"
          autofocus
        />
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import { minLength, required } from "vuelidate/lib/validators";

const groupNameMinLength = 3;

export default {
  name: "GroupAdd",
  data() {
    return {
      form: {
        groupName: ""
      },
      formSubmissionFailed: false,
      formSubmissionFailedMessage: ""
    };
  },
  computed: {
    groupState() {
      if (
        this.$v.form.groupName.$model === null ||
        this.$v.form.groupName.$model === ""
      ) {
        return null;
      }
      if (this.formSubmissionFailed) {
        return false;
      }
      return !this.$v.form.groupName.$error;
    },
    groupNameInvalidFeedback() {
      if (this.$v.form.groupName.$invalid) {
        return `Group name must be at least ${groupNameMinLength} characters`;
      } else if (this.formSubmissionFailed) {
        return this.formSubmissionFailedMessage;
      }
      return null;
    },
    isDisabled() {
      return this.$v.form.$invalid;
    }
  },
  validations: {
    form: {
      groupName: {
        required,
        minLength: minLength(groupNameMinLength)
      }
    }
  },
  methods: {
    resetFormSubmission() {
      this.formSubmissionFailed = false;
    },
    addNewGroup: async function(event) {
      event.preventDefault();

      if (!this.$v.$invalid) {
        const groupName = this.$v.form.groupName.$model;
        const result = await this.$store.dispatch(
          "Groups/ADD_GROUP",
          groupName
        );

        if (result !== undefined) {
          this.formSubmissionFailed = true;
          this.formSubmissionFailedMessage = result;
        } else {
          this.$router.push(`/groups/${groupName}`);
        }
      }
    },
    reset() {
      this.form = {
        groupName: null
      };
      this.$refs["input-groupname"].focus();
    }
  }
};
</script>
