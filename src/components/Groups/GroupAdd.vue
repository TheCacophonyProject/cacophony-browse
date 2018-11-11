<template>
  <b-card-group
    deck
    class="group-add">
    <b-card bg-variant="light">

      <b-form
        inline
        class="add-group-form"
        @submit="addNewGroup">

        <b-form-group
          :state="!$v.form.groupName.$error"
          :invalid-feedback="groupNameInvalidFeedback"
          label-for="input-groupname"
          horizontal
        >
          <b-form-input
            id="input-groupname"
            :state="!$v.form.groupName.$error"
            v-model="$v.form.groupName.$model"
            aria-describedby="input1LiveFeedback"
            type="text"
            placeholder="Group name"
            autofocus
          />
        </b-form-group>

        <b-form-group>
          <b-button
            :disabled="$v.form.$invalid || !fetched"
            type="submit"
            variant="primary">
            Create new group
          </b-button>
        </b-form-group>
      </b-form>

    </b-card>
  </b-card-group>
</template>

<script>
import {minLength, required} from 'vuelidate/lib/validators';
import {mapState} from 'vuex';

const groupNameMinLength = 3;

export default {
  name: 'GroupAdd',
  data() {
    return {
      form: {
        groupName: ''
      }
    };
  },
  computed: {
    groupNameInvalidFeedback() {
      if (this.$v.form.groupName.$invalid) {
        return `Group name must be at least ${groupNameMinLength} characters`;
      }
    },
    ...mapState({
      fetched: state => state.Groups.fetched
    })
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
    addNewGroup(event) {
      event.preventDefault();

      if (!this.$v.$invalid) {
        const groupName = this.$v.form.groupName.$model;
        /* eslint-disable */
        this.$store.dispatch('Groups/ADD_GROUP', groupName).then(() => {
          this.$router.push(`/groups/${groupName}`);
        }).catch(error => {
        });
        /* eslint-enable */
      }
    }
  }
};
</script>

<style>
  .group-add {
    margin-bottom: 1rem;
  }

  .add-group-form {
    flex-wrap: wrap;
  }

  .input {
    width: 100%;
    margin-right: 0;
  }

  @media only screen and (min-width: 576px) {
    .add-group-form {
      flex-wrap: nowrap;
      justify-content: space-evenly;
    }

    .input {
      width: auto;
      margin-right: 1rem;
    }
  }
</style>
