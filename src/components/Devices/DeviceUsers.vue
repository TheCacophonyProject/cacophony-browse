<template>
  <b-container class="users">
    <h2>
      Users <help>{{ usersHelpTip }}</help>
    </h2>
    <div class="description-and-button-wrapper">
      <p v-if="isDeviceAdmin">
        Users can view recordings for this device. Note that users that belong
        to a group that contains this device can also view the recordings.
      </p>
      <p v-else>
        Only device administrators can view users are associaed with this
        device.
      </p>
      <device-add-user v-if="isDeviceAdmin" :device="device" />
      <b-button
        v-if="isDeviceAdmin"
        v-b-modal.device-add-user
        variant="primary"
        v-b-tooltip.hover
        title="Add user to device"
        class="add-button"
      >
        <font-awesome-icon icon="user-plus" size="xs" />
        <span>Add user</span>
      </b-button>
    </div>
    <div v-if="device && device.users">
      <div v-if="!device.users.length">
        <b-card class="no-content-placeholder">
          This device has no users associated with it.
        </b-card>
      </div>
      <div v-else>
        <b-table
          :items="device.users"
          :fields="deviceUsersTableFields"
          :sort-by="userSortBy"
          striped
          hover
          outlined
          responsive
          data-cy="users-table"
        >
          <template v-slot:cell(controls)="data">
            <b-modal
              id="device-user-remove-self"
              title="Remove yourself from device"
              @ok="removeDeviceUser(data.item.username)"
              ok-title="Remove"
              ok-variant="danger"
              v-model="showUserRemoveSelfModal"
            >
              <p>
                Are you sure you want to remove yourself from this device? You
                will no longer be able to view recordings from this device and
                you will not be able to add yourself back to the device.
              </p>
            </b-modal>
            <b-button
              v-b-tooltip.hover
              v-if="isDeviceAdmin"
              title="Remove user from device"
              class="trash-button"
              variant="light"
              @click="removeDeviceUserCheckIfSelf(data.item.username, uiUser)"
            >
              <font-awesome-icon icon="trash" size="1x" />
            </b-button>
          </template>
        </b-table>
      </div>
    </div>
  </b-container>
</template>

<script>
import { mapState } from "vuex";
import DeviceAddUser from "./DeviceAddUser.vue";
import Help from "../Help.vue";

export default {
  name: "DeviceUsers",
  components: { DeviceAddUser, Help },
  props: {
    device: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      deviceUsersTableFields: [
        { key: "userName", label: "Username" },
        { key: "admin", label: "Administrator" },
        {
          key: "controls",
          label: "",
          class: "device-actions-cell",
        },
      ],
      userSortBy: "userName",
      usersHelpTip: "Only administrators can add new users.",
      showUserRemoveSelfModal: false,
    };
  },
  computed: mapState({
    uiUser: (state) => state.User.userData.username,
    isDeviceAdmin: function () {
      return this.device ? this.device.userIsAdmin : false;
    },
  }),
  methods: {
    async removeDeviceUser(userName) {
      await this.$store.dispatch("Devices/REMOVE_USER", {
        userName,
        device: this.device,
      });
    },
    async removeDeviceUserCheckIfSelf(userName, uiUser) {
      if (userName == uiUser) {
        this.showUserRemoveSelfModal = true;
      } else {
        this.removeDeviceUser(userName);
      }
    },
  },
};
</script>
<style scoped></style>
