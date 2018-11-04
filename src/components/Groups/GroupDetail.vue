<template>
  <div class="container">
    <div class="group-detail row">
      <div class="users-detail col-lg-7">
        <h2>Users <help :help-text="usersHelpTip"/></h2>
        <b-table
          :items="group.GroupUsers"
          :fields="groupUsersTableFields"
          :sort-by="userSortBy"
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

        <h2>Add user</h2>
        <group-user-add
          v-if="isGroupAdmin"
          :group="group"/>
      </div>

      <div class="devices-detail col-lg-5">
        <h2>Devices <help :help-text="devicesHelpTip"/></h2>
        <b-table
          :items="group.Devices"
          :fields="deviceTableFields"
          :sort-by="deviceSortBy"
          hover
          responsive>

          <template
            slot="devicename"
            slot-scope="row">
            <b-link :to="{ name: 'device', params: { devicename: row.item.devicename }}">{{ row.item.devicename }}</b-link>
          </template>
        </b-table>
      </div>
    </div>

  </div>
</template>

<script>
import GroupUserAdd from "./GroupUserAdd.vue";
import Help from "../Help.vue";
import IconLink from "../IconLink.vue";

export default {
  name: "GroupDetail",
  components: {GroupUserAdd, Help, IconLink},
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
        {key: 'username', label: 'User Name', sortable: 'true'},
        {key: 'admin', label: 'Admin'},
        {key: 'controls', label: '', class: 'device-actions-cell'}
      ],
      userSortBy: 'username',
      deviceTableFields: [
        {key: 'devicename', label: 'Device Name', sortable: 'true'},
      ],
      deviceSortBy: 'devicename',
      usersHelpTip: {
        title: 'Users',
        content: '<p>These are the users who can view recordings for the group\'s devices.</p>' +
          '<p>If you are a group admin, you can also add new users.</p>'
      },
      devicesHelpTip: {
        title: 'Devices',
        content: '<p>These are devices that this group manages.</p>' +
          '<p>Devices specify which group they belong to when they first register.   Therefore the devices ' +
          'list cannot be edited.</p>'
      }
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

  .users-detail {
    border-right: 1px solid #ddd;
  }

  h2 {
    font-size: large;
    margin-top: 2rem;
  }
</style>
