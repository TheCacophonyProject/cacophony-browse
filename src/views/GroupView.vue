<template>
  <b-container fluid>

    <template v-if="group">
      <h1>{{ group.groupname }}</h1>
      <b-row>
        <b-col>

          <h4>Users</h4>

          <template>
            <b-table
              :items="groupUsers"
              :fields="userTableFields"
              striped
              hover
              responsive>

              <template
                slot="deleteButton"
                slot-scope="row">
                <font-awesome-icon
                  v-if="owner.GroupUsers.admin && owner.id != row.item.id"
                  icon="trash"
                  size="1x"
                  style="cursor: pointer;"
                  @click="removeGroupUser(group.id,row.item.id)"/>
              </template>
            </b-table>
          </template>

          <b-card-group deck>
            <b-card bg-variant="light">

              <h4>Group Admin</h4>

              <b-alert
                :show="!!addUserErrorMessage"
                variant="danger"
                dismissible
                @dismissed="addUserErrorMessage=undefined">
                {{ addUserErrorMessage }}
              </b-alert>

              <b-form @submit="addGroupUser">

                <b-row align-h="end">
                  <b-form-group>
                    <b-form-checkbox
                      v-model="addGroupUserAdmin"
                      plain
                      value="true"
                      unchecked-value="false">
                      Is admin?
                    </b-form-checkbox>
                  </b-form-group>
                </b-row>

                <!-- TODO: Check if Add User by UserId(Number) is preferable to UserName -->
                <b-form-group
                  label="User Id"
                  label-for="input-username"
                  horizontal
                >
                  <b-form-input
                    id="input-username"
                    v-model="addGroupUserName"
                    type="text"
                    autofocus
                  />
                </b-form-group>

                <b-form-group>
                  <b-button
                    type="submit"
                    variant="primary">
                    Add user
                  </b-button>
                </b-form-group>
              </b-form>

            </b-card>
          </b-card-group>

        </b-col>
        <b-col>

          <h4>Devices</h4>
          <!-- TODO: Format groups > devices table once functionality to add devices exists -->
          <b-table
            :items="devices"
            striped
            hover
            responsive>

            <template
              slot="devicename"
              slot-scope="row">
              <b-link :to="{ name: 'device', params: { devicename: row.item.devicename }}">{{ row.item.devicename }}</b-link>
            </template>
          </b-table>

        </b-col>
      </b-row>
    </template>

  </b-container>
</template>

<script>

import {mapState} from 'vuex';

export default {
  name: 'GroupView',
  props: {},
  data() {
    return {
      addGroupUserName: null,
      addGroupUserAdmin: false,
      addUserErrorMessage: null,
      userTableFields: [
        {key: 'username', label: 'User'},
        {key: 'isAdmin', label: 'Admin'},
        {key: 'deleteButton', label: ''}
      ]
    };
  },
  computed:
    mapState({
      group: state => state.Groups.groups[0],
      owner: state => state.Groups.groups[0].Users[0],
      groupUsers: state => state.Groups.groups[0].GroupUsers,
      devices: state => state.Groups.groups[0].Devices
    })
  ,
  watch: {
    '$route'() {
      this.fetchGroups();
    }
  },
  created: function () {
    this.fetchGroups();
  },
  methods: {
    fetchGroups: function () {
      this.$store.dispatch('Groups/GET_GROUPS', this.$route.params.groupname);
    },
    addGroupUser: function (event) {
      event.preventDefault();
      const userParams = {
        userName: this.addGroupUserName,
        isAdmin: this.addGroupUserAdmin,
        groupId: this.groupData.group.id
      };

      this.$store.dispatch('Groups/ADD_GROUP_USER', userParams).then(() => {
        this.fetchGroups();
      }).catch(error => {
        this.addUserErrorMessage = error;
      });
    },
    removeGroupUser: function (groupId, userId) {
      this.$store.dispatch('Groups/REMOVE_GROUP_USER', {groupId, userId}).then(() => {
        this.fetchGroups();
      }).catch(error => {
        this.addUserErrorMessage = error;
      });
    }
  }
};
</script>
