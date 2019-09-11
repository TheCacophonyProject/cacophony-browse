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

        <b-button
          v-b-tooltip.hover
          v-if="isDeviceAdmin"
          title="Remove user from device"
          class="trash-button"
          @click="removeUser(data.item.username, uiUser)">
          <font-awesome-icon
            icon="trash"
            size="1x"
            style="cursor: pointer;"/>
        </b-button>
      </template>
    </b-table>

    <device-add-user v-if="isDeviceAdmin"/>
  </div>
</template>

<script>
import { mapState } from "vuex";
import DeviceAddUser from "./DeviceAddUser.vue";
import Help from "../Help.vue";

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
        { key: "username", label: "User Name" },
        { key: "admin", label: "Admin" },
        {
          key: "controls",
          label: "",
          class: "device-actions-cell"
        }
      ],
      userSortBy: "username",
      usersHelpTip: {
        title: "Users",
        content:
          "<p>These are the users who can view recordings just for this device.  (The device's group users " +
          " can also view the recordings)</p>" +
          "<p>If you are an admin, you can also add device users.</p>"
      }
    };
  },
  computed: mapState({
    uiUser: state => state.User.userData.username,
    isDeviceAdmin: function() {
      if (this.user && this.device.Users) {
        const username = this.user.username;
        return (
          this.user.globalPermission == "write" ||
          this.device.Users.some(
            user => user.DeviceUsers.admin && user.username === username
          )
        );
      }
      return false;
    }
  }),
  methods: {
    async removeUser(userName, uiUser) {
      if (userName == uiUser) {
        // TODO make this dialog look nicer (same for groups)
        var retVal = confirm(
          "Are you sure you want to remove yourself from this device?  If you countinue " +
            "will no longer be able to view recordings from this device and you will not be able to " +
            "add yourself back to the group.\n\nDo you want to continue?"
        );
        if (retVal == false) {
          return;
        }
      }
      await this.$store.dispatch("Devices/REMOVE_USER", {
        userName,
        device: this.device
      });
    }
  }
};
</script>

<style scoped>
.device-detail {
  margin-top: 15px;
}

h2 {
  font-size: x-large;
  margin-top: 1.5rem;
}

button.trash-button {
  padding: 0;
  background: inherit;
  color: black;
  border: none;
}
</style>
