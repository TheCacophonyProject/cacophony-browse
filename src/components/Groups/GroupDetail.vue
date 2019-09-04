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
          outlined
          responsive>

          <template
            slot="admin"
            slot-scope="data">
            {{ data.item.isAdmin }}
          </template>

          <template
            slot="controls"
            slot-scope="data">

            <b-button
              v-b-tooltip.hover
              v-if="isGroupAdmin"
              title="Remove user from group"
              class="trash-button"
              @click="removeUser(data.item.username, uiUser)">
              <font-awesome-icon
                icon="trash"
                size="1x"
                style="cursor: pointer;"/>
            </b-button>
          </template>
        </b-table>

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
          outlined
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
import { mapState } from "vuex";
import GroupUserAdd from "./GroupUserAdd.vue";
import Help from "../Help.vue";
import IconLink from "../IconLink.vue";

export default {
  name: "GroupDetail",
  components: { GroupUserAdd, Help, IconLink },
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
        { key: "username", label: "User Name", sortable: "true" },
        { key: "admin", label: "Admin" },
        { key: "controls", label: "", class: "device-actions-cell" }
      ],
      userSortBy: "username",
      deviceTableFields: [
        { key: "devicename", label: "Device Name", sortable: "true" }
      ],
      deviceSortBy: "devicename",
      usersHelpTip: {
        title: "Users",
        content:
          "<p>These are the users who can view recordings for the group's devices.</p>" +
          "<p>If you are a group admin, you can also add new users.</p>"
      },
      devicesHelpTip: {
        title: "Devices",
        content:
          "<p>These are devices that this group manages.</p>" +
          "<p>Devices specify which group they belong to when they first register.   Therefore the devices " +
          "list cannot be edited.</p>"
      }
    };
  },
  computed: mapState({
    uiUser: state => state.User.userData.username,
    isGroupAdmin: function() {
      if (this.user && this.group.GroupUsers) {
        const username = this.user.username;
        return (
          this.user.globalPermission == "write" ||
          this.group.GroupUsers.some(
            user => user.isAdmin && user.username === username
          )
        );
      }
      return false;
    }
  }),
  methods: {
    async removeUser(username, uiUser) {
      if (username == uiUser) {
        // TODO make this dialog look nicer (same for device)
        var retVal = confirm(
          "Are you sure you want to remove yourself from this group?  If you countinue " +
            "will no longer be able to view recordings from the devices in this group and you will not be able to " +
            "add yourself back to the group.\n\nDo you want to continue ?"
        );
        if (retVal == false) {
          return;
        }
      }
      await this.$store.dispatch("Groups/REMOVE_GROUP_USER", {
        userName: username,
        groupName: this.group.groupname
      });
    }
  }
};
</script>

<style scoped>
.group-detail {
  margin-top: 15px;
}

.users-detail,
.devices-detail {
  padding-left: 0px;
  padding-right: 0px;
}

@media (min-width: 992px) {
  .users-detail {
    padding-right: 30px;
  }

  .devices-detail {
    padding-left: 30px;
  }
}

h2 {
  font-size: x-large;
  margin-top: 2rem;
}

button.trash-button {
  padding: 0;
  background: inherit;
  color: black;
  border: none;
}
</style>
