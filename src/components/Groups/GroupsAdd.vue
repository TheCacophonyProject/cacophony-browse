<template>
  <div>
    <b-card-group deck>
      <b-card bg-variant="light">

        <b-alert
          :show="!!addGroupErrorMessage"
          variant="danger"
          dismissible
          @dismissed="addGroupErrorMessage=undefined">
          {{ addGroupErrorMessage }}
        </b-alert>

        <b-form @submit="addNewGroup">
          <b-form-group
            :state="!$v.form.groupName.$error"
            :invalid-feedback="groupNameInvalidFeedback"
            label="Group name"
            label-for="input-groupname"
            horizontal
          >
            <b-form-input
              id="input-groupname"
              :state="!$v.form.groupName.$error"
              v-model="$v.form.groupName.$model"
              aria-describedby="input1LiveFeedback"
              type="text"
              autofocus
            />
          </b-form-group>

          <b-form-group>
            <b-button
              :disabled="$v.form.$invalid"
              type="submit"
              variant="primary">
              Add group
            </b-button>
          </b-form-group>
        </b-form>

      </b-card>
    </b-card-group>
  </div>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators';

const groupNameMinLength = 3;

export default {
  name: 'GroupAdd',
  props: {},
  data() {
    return {
      addGroupErrorMessage: null,
      form: {
        groupName: ''
      }
    };
  },
  computed: {
    groupNameInvalidFeedback() {
      if(this.$v.form.groupName.$invalid) {
        return `Group name must be at least ${groupNameMinLength} characters`;
      }
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
    addNewGroup (event) {
      event.preventDefault();

      if(!this.$v.$invalid) {
        const groupName = this.$v.form.groupName.$model;

        this.$store.dispatch('Groups/ADD_GROUP', { groupName }).then(() => {
          this.$router.push(`/groups/${groupName}`);
        }).catch(error => {
          this.addGroupErrorMessage = error.message;
        });
      }
    }
  }
};
</script>
