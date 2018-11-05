<template>
  <div class="device-detail">
    <h2>Users <help :help-text="usersHelpTip"/></h2>

    <b-table
      :items="device.Users"
      :fields="deviceUsersTableFields"
      :sort-by="userSortBy"
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

        <font-awesome-icon
          v-if="isDeviceAdmin"
          icon="trash"
          size="1x"
          style="cursor: pointer;"
          @click="removeUser(data.item.username)"/>

      </template>
    </b-table>

    <h2>Add user</h2>
    <device-add-user v-if="isDeviceAdmin"/>
  </div>
</template>

<script>
import DeviceAddUser from './DeviceAddUser.vue';
import Help from '../Help.vue';

export default {
  name: "DeviceDetail",
  components: { DeviceAddUser, Help },
  props: {
    device: {
      type: Object,
      required: true
    },
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      deviceUsersTableFields: [
        {key: 'username', label: 'User Name'},
        {key: 'admin', label: 'Admin'},
        {key: 'controls', label: '', class: 'device-actions-cell'}
      ],
      userSortBy: 'username',
      usersHelpTip: {
        title: 'Users',
        content: '<p>These are the users who can view recordings just for this device.  (The device\'s group users ' +
          ' can also view the recordings)</p>' +
          '<p>If you are an admin, you can also add device users.</p>'
      },
    };
  },
  computed: {
    isDeviceAdmin() {
      if (this.user && this.device.Users) {
        const username = this.user.username;
        // hack - as long as they are not added (ie global admin) or added as an admin user.
        return !this.device.Users.some(user => username === user.username && !user.DeviceUsers.admin);
      }
      return false;
    },
  },
  methods: {
    async removeUser(userName) {
      await this.$store.dispatch('Devices/REMOVE_USER', {userName, device: this.device});
    }
  }
};
</script>

<style scoped>
  .device-detail {
    margin-top: 15px;
  }

  h2 {
    font-size: medium;
    margin-top: 1rem;
  }

  @media only screen and (min-width: 576px) {
    h2 {
      font-size: large;
      margin-top: 1.5rem;
    }
  }
</style>
