<template>
  <div class="group-detail">
    <h2>Users</h2>
    <b-table
      :items="group.GroupUsers"
      :fields="groupUsersTableFields"
      striped
      hover
      responsive>

      <template
        slot="admin"
        slot-scope="data">
        {{ data.item.isAdmin }}
      </template>

      <template
        slot="controls"
        slot-scope="data">

        <font-awesome-icon
          v-if="isGroupAdmin"
          icon="trash"
          size="1x"
          style="cursor: pointer;"
          @click="removeUser(data.item.username)"/>

      </template>
    </b-table>

    <group-user-add
      v-if="isGroupAdmin"
      :group="group"/>

    <h2>Devices</h2>
    <b-table
      :items="group.Devices"
      striped
      hover
      responsive>

      <template
        slot="devicename"
        slot-scope="row">
        <b-link :to="{ name: 'device', params: { devicename: row.item.devicename }}">{{ row.item.devicename }}</b-link>
      </template>
    </b-table>


  </div>
</template>

<script>
import GroupUserAdd from "./GroupUserAdd.vue";

export default {
  name: "GroupDetail",
  components: {GroupUserAdd},
  props: {
    group: {
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
      groupUsersTableFields: [
        {key: 'id', label: 'Id'},
        {key: 'username', label: 'User Name'},
        {key: 'admin', label: 'Admin'},
        {key: 'controls', label: '', class: 'device-actions-cell'}
      ]
    };
  },
  computed: {
    isGroupAdmin() {
      if (this.user && this.group.GroupUsers) {
        const username = this.user.username;
        // hack - as long as they are not added (ie global admin) or added as an admin user.
        return !this.group.GroupUsers.some(user => username === user.username && !user.isAdmin);
      }
      return false;
    },
  },
  methods: {
    async removeUser(username) {
      await this.$store.dispatch('Groups/REMOVE_GROUP_USER', {userName: username, groupName: this.group.groupname});
    },
  }
};
</script>

<style scoped>

  .group-detail {
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
