<template>
  <div class="container">
    <b-row>
      <b-col class="col-12 col-lg-7">
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
            data-cy="add_button"
          >
            <font-awesome-icon icon="user-plus" size="xs" />
            <span>Add user</span>
          </b-button>
        </div>

        <div v-if="!group.hasOwnProperty('Users') || !group.Users.length">
          <b-card class="no-content-placeholder">
            <p>This group has no users associated with it.</p>
          </b-card>
        </div>
        <div v-else>
          <b-table
            :items="group.GroupUsers"
            :fields="groupUsersTableFields"
            :sort-by="userSortBy"
            striped
            hover
            outlined
            responsive
            data-cy="users-table"
          >
            <template v-slot:cell(admin)="data">
              {{ data.item.isAdmin ? "Yes" : "No" }}
            </template>

            <template v-slot:cell(deleteButton)="data">
              <b-modal
                id="group-user-remove-self"
                title="Remove yourself from group"
                @ok="removeUser(data.item.username)"
                ok-title="Remove"
                ok-variant="danger"
                v-model="showUserRemoveSelfModal"
              >
                <p>
                  Are you sure you want to remove yourself from this group? You
                  will no longer be able to view recordings from the devices in
                  this group and you will not be able to add yourself back to
                  the group.
                </p>
              </b-modal>
              <b-button
                v-b-tooltip.hover
                v-if="isGroupAdmin"
                title="Remove user from group"
                class="trash-button"
                variant="light"
                @click="removeUserCheckIfSelf(data.item.username, uiUser)"
              >
                <font-awesome-icon icon="trash" size="1x" />
              </b-button>
            </template>
          </b-table>
        </div>
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
          data-cy="devices-table"
        >
          <template v-slot:cell(devicename)="row">
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
          label: "Username",
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
      },
      showUserRemoveSelfModal: false
    };
  },
  computed: mapState({
    uiUser: state => state.User.userData.username,
    isGroupAdmin: function() {
      if (this.user && this.group.Users) {
        const username = this.user.username;
        return (
          this.user.globalPermission === "write" ||
          this.group.Users.some(
            user => user.GroupUsers.admin && user.username === username
          )
        );
      }
      return false;
    }
  }),
  methods: {
    async removeUser(userName) {
      await this.$store.dispatch("Groups/REMOVE_GROUP_USER", {
        userName,
        groupName: this.group.groupname
      });
    },

    async removeUserCheckIfSelf(userName, uiUser) {
      if (userName === uiUser) {
        this.showUserRemoveSelfModal = true;
      } else {
        this.removeUser(userName);
      }
    }
  }
};
</script>
