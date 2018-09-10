<template>
  <div class="device-detail">
    <h2>Users</h2>

    <b-table
      :items="device.Users"
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

        <!-- TODO: Review the role restrictions for Devices Admin - See GroupDetail.vue for example -->
        <font-awesome-icon
          icon="trash"
          size="1x"
          style="cursor: pointer;"
          @click="removeUser(data.item.id)"/>

      </template>
    </b-table>
    <device-add-user />
  </div>
</template>

<script>
import DeviceAddUser from './DeviceAddUser.vue';

export default {
  name: "DeviceDetail",
  components: { DeviceAddUser },
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
        {key: 'id', label: 'Id'},
        {key: 'username', label: 'User Name'},
        {key: 'admin', label: 'Admin'},
        {key: 'controls', label: '', class: 'device-actions-cell'}
      ]
    };
  },
  methods: {
    async removeUser(userId) {
      await this.$store.dispatch('Devices/REMOVE_USER', {userId, device: this.device});
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
