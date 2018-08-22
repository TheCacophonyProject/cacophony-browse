<template>
  <div class="container">
    <b-table
      :items="currentDevice.Users"
      :fields="deviceUsersTableFields"
      striped
      hover
      responsive>

      <template
        slot="admin"
        slot-scope="data">
        {{ data.item.DeviceUsers.admin }}
      </template>

      <template
        slot="controls"
        slot-scope="data">

        <!-- FIXME: Review the role restrictions for Devices - v-if="data.item.DeviceUsers.admin && data.item.DeviceUsers.UserId != currentDevice.Users[0].id"-->
        <font-awesome-icon
          icon="trash"
          size="1x"
          style="cursor: pointer;"
          @click="removeUser(data.item.id)"/>

      </template>
    </b-table>

    <b-card bg-variant="light">

      <b-form
        inline
        class="add-user-form"
        @submit="addUser">

        <div class="input">
          <b-form-group
            :state="!$v.form.username.$error"
            :invalid-feedback="usernameInvalidFeedback"
            label="User Id"
            label-for="input-usernameInvalidFeedback"
            horizontal
          >
            <b-input
              id="input-groupname"
              :state="!$v.form.username.$error"
              v-model="$v.form.username.$model"
              aria-describedby="input1LiveFeedback"
              type="text"
              class=""
              autofocus
            />
          </b-form-group>
        </div>

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
            Add
          </b-button>
        </div>
      </b-form>

    </b-card>
  </div>
</template>

<script>
import {required} from 'vuelidate/lib/validators';
import {mapState} from 'vuex';

export default {
  name: "DeviceDetail",
  data() {
    return {
      deviceUsersTableFields: [
        {key: 'id', label: 'Id'},
        {key: 'username', label: 'User Name'},
        {key: 'admin', label: 'Admin'},
        {key: 'controls', label: '', class: 'device-actions-cell'}
      ],
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
      currentDevice: state => state.Devices.currentDevice
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
          deviceId: this.currentDevice.id,
          admin: this.$v.form.isAdmin.$model
        };

        await this.$store.dispatch('Devices/ADD_USER', params);
      }
    },
    async removeUser(userId) {
      await this.$store.dispatch('Devices/REMOVE_USER', {userId, deviceid: this.currentDevice.id});
    }
  }
};
</script>

<style scoped>
  .container {
    margin-top: 15px;
  }

  .add-user-form {
    flex-wrap: wrap;
  }
  .input {
    width: 100%;
    margin-right: 0;
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
    }
    .options {
      flex-direction: row;
      display: flex;
      justify-content: space-between;
      width: auto;
    }
  }
</style>
