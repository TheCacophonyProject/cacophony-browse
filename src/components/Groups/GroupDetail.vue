<template>
  <div class="container">
    <b-row class="group-detail">
      <b-col class="users-detail col-12 col-lg-7">
        <h2>Users <help :help-text="usersHelpTip" /></h2>
        <div class="description-and-button-wrapper">
          <p>
            Users can view recordings for the devices associated with this
            group.
          </p>
          <group-user-add v-if="isGroupAdmin" :group="group" />
          <b-button
            v-if="isGroupAdmin"
            v-b-modal.group-user-add
            variant="primary"
            v-b-tooltip.hover
            title="Add user to group"
            class="add-button"
          >
            <font-awesome-icon icon="user-plus" size="xs" />
            <span>Add user</span>
          </b-button>
        </div>
        <b-table
          :items="group.GroupUsers"
          :fields="groupUsersTableFields"
          :sort-by="userSortBy"
          striped
          hover
          outlined
          responsive
        >
          <template slot="admin" slot-scope="data">
            {{ data.item.isAdmin ? "Yes" : "No" }}
          </template>

          <template slot="controls" slot-scope="data">
            <b-button
              v-b-tooltip.hover
              v-if="isGroupAdmin"
              title="Remove user from group"
              class="trash-button"
              variant="light"
              @click="removeUser(data.item.username, uiUser)"
            >
              <font-awesome-icon
                icon="trash"
                size="1x"
                style="cursor: pointer;"
              />
            </b-button>
          </template>
        </b-table>
      </b-col>

      <b-col class="devices-detail col-12 col-lg-5">
        <h2>Devices <help :help-text="devicesHelpTip" /></h2>
        <p>Devices associated with this group.</p>
        <b-table
          :items="group.Devices"
          :fields="deviceTableFields"
          :sort-by="deviceSortBy"
          hover
          outlined
          responsive
        >
          <template slot="devicename" slot-scope="row">
            <b-link
              :to="{
                name: 'device',
                params: { devicename: row.item.devicename }
              }"
              >{{ row.item.devicename }}</b-link
            >
          </template>
        </b-table>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Help from "../Help.vue";
import GroupUserAdd from "./GroupUserAdd.vue";

export default {
  name: "GroupDetail",
  components: { Help, GroupUserAdd },
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
        {
          key: "username",
          label: "User Name",
          sortable: "true"
        },
        { key: "admin", label: "Administrator" },
        {
          key: "controls",
          label: "",
          class: "device-actions-cell"
        }
      ],
      userSortBy: "username",
      deviceTableFields: [
        {
          key: "devicename",
          label: "Device Name",
          sortable: "true"
        }
      ],
      deviceSortBy: "devicename",
      usersHelpTip: {
        title: "Only administrators can add new users"
      },
      devicesHelpTip: {
        title:
          "Devices specify which group they belong to when they first register. They can't be edited here."
      }
    };
  },
  computed: mapState({
    uiUser: state => state.User.userData.username,
    isGroupAdmin: function() {
      // FIXME - This seems to return the wrong result in Firefox
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

<style lang="scss" scoped>
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/mixins";

.view.container-fluid {
  padding: 0;
}

h2 {
  font-size: x-large;
}

.description-and-button-wrapper {
  display: flex;
  flex-flow: row;
  align-items: center;
  margin-bottom: 1em;
  p {
    margin-bottom: 0;
  }
  .add-button {
    white-space: nowrap;
    margin-left: auto;
  }
}

.help {
  color: $gray-400;
  font-size: large;
}

@include media-breakpoint-down(sm) {
  .add-button {
    position: fixed;
    bottom: 1em;
    right: 1em;
    z-index: 1;
  }
}

button.trash-button {
  padding: 0 0.5em;
  background: transparent;
  border: none;
}
</style>
