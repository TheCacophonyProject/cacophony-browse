<template>
  <div>
    <h1>Add new group</h1>
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
            :state="groupNameState"
            label="Group name"
            label-for="input-groupname"
            horizontal
          >
            <b-form-input
              id="input-groupname"
              :state="groupNameState"
              v-model="addGroupName"
              type="text"
              autofocus
            />
          </b-form-group>

          <b-form-group>
            <b-button
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
const groupNameMinLength = 3;

export default {
  name: 'GroupAdd',
  data() {
    return {
      addGroupErrorMessage: null,
      addGroupName: ""
    };
  },
  computed: {
    groupNameState () {
      return this.addGroupName.length >= groupNameMinLength;
    }
  },
  methods: {
    addNewGroup: function (event) {
      event.preventDefault();

      if(!this.groupNameState) {
        return this.addGroupErrorMessage = `Group name must be at least ${groupNameMinLength} characters long`;
      }

      const params = {
        groupName: this.addGroupName
      };

      this.$store.dispatch('Groups/NEW_GROUP', params).then(() => {
        this.$router.push(`/groups/${this.addGroupName}`);
      }).catch(error => {
        this.addGroupErrorMessage = error.message;
      });
    }
  }
};
</script>
