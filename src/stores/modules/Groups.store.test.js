jest.genMockFromModule('../../api/Groups.api');
jest.mock('../../api/Groups.api');

import api from '../../api/Groups.api';
import store from '../../stores';
import GroupsStore from '../../stores/modules/Groups.store';

describe('Actions', () => {

  const
    testName = "some name",
    testGroupId = 123456,
    testUserId = 654321,
    testUserName = "some user name",
    testIsAdmin = false;

  store.commit = jest.fn();

  describe('GET_GROUPS', () => {

    test('calls api.groups.getGroups()', async () => {
      const testResult = {success: true};
      api.getGroups.mockReturnValueOnce(testResult);

      await store.dispatch('Groups/GET_GROUPS', testName);

      expect(api.getGroups).toHaveBeenCalledTimes(1);
      expect(api.getGroups).toHaveBeenCalledWith(testName);
    });

    test('commits success.true mutations', async () => {
      const testResult = {success: true};
      api.getGroups.mockReturnValueOnce(testResult);

      await store.dispatch('Groups/GET_GROUPS', testName);

      expect(store.commit).toHaveBeenCalledTimes(3);
      expect(store.commit).toHaveBeenNthCalledWith(1, "Groups/fetching", undefined, undefined);
      expect(store.commit).toHaveBeenNthCalledWith(2, 'Groups/fetched', undefined, undefined);
      expect(store.commit).toHaveBeenNthCalledWith(3, 'Groups/receiveGroups', testResult, undefined);
    });
    test('commits success.false mutations', async () => {
      api.getGroups.mockReturnValueOnce({success: false});

      await store.dispatch('Groups/GET_GROUPS', testName);

      expect(store.commit).toHaveBeenCalledTimes(2);
      expect(store.commit).toHaveBeenNthCalledWith(1, "Groups/fetching", undefined, undefined);
      expect(store.commit).toHaveBeenNthCalledWith(2, 'Groups/fetched', undefined, undefined);
      expect(store.commit).not.toHaveBeenCalledWith('Groups/receiveGroups');
    });
  });

  describe('ADD_GROUP', () => {
    test('calls api.groups.addNewGroup()', async () => {
      const testResult = {success: true};
      api.addNewGroup.mockReturnValueOnce(testResult);

      await store.dispatch('Groups/ADD_GROUP', testName);

      expect(api.addNewGroup).toHaveBeenCalledTimes(1);
      expect(api.addNewGroup).toHaveBeenCalledWith(testName);
    });
    test('commits success.true mutations', async () => {
      const testResult = {success: true, messages: []};
      api.addNewGroup.mockReturnValueOnce(testResult);

      await store.dispatch('Groups/ADD_GROUP', testName);

      expect(store.commit).toHaveBeenCalledTimes(3);
      expect(store.commit).toHaveBeenNthCalledWith(1, "Groups/fetching", undefined, undefined);
      expect(store.commit).toHaveBeenNthCalledWith(2, 'Groups/fetched', undefined, undefined);
      expect(store.commit).toHaveBeenNthCalledWith(3, 'Groups/receiveUpdate', testResult, undefined);
    });
    test('commits success.false mutations', async () => {
      api.addNewGroup.mockReturnValueOnce({success: false});

      await store.dispatch('Groups/ADD_GROUP', testName);

      expect(store.commit).toHaveBeenCalledTimes(2);
      expect(store.commit).toHaveBeenNthCalledWith(1, "Groups/fetching", undefined, undefined);
      expect(store.commit).toHaveBeenNthCalledWith(2, 'Groups/fetched', undefined, undefined);
      expect(store.commit).not.toHaveBeenCalledWith('Groups/receiveUpdate');
    });
  });

  describe('ADD_GROUP_USER', async () => {

    test('calls api.groups.addNewGroup()', async () => {
      const
        testResult = {success: true},
        testParams ={
          groupId: testGroupId,
          userName: testUserName,
          isAdmin: testIsAdmin
      };
      api.addGroupUser.mockReturnValueOnce(testResult);

      await store.dispatch('Groups/ADD_GROUP_USER', testParams);

      expect(api.addGroupUser).toHaveBeenCalledTimes(1);
      expect(api.addGroupUser).toHaveBeenCalledWith(testGroupId, testUserName, testIsAdmin);
    });

    test('commits success.true mutations', async () => {
      const testResult = {success: true, messages: []};
      api.addGroupUser.mockReturnValueOnce(testResult);

      await store.dispatch('Groups/ADD_GROUP_USER', testName);

      expect(store.commit).toHaveBeenCalledTimes(3);
      expect(store.commit).toHaveBeenNthCalledWith(1, "Groups/fetching", undefined, undefined);
      expect(store.commit).toHaveBeenNthCalledWith(2, 'Groups/fetched', undefined, undefined);
      expect(store.commit).toHaveBeenNthCalledWith(3, 'Groups/receiveUpdate', testResult, undefined);
    });

    test('commits success.false mutations', async () => {
      api.addGroupUser.mockReturnValueOnce({success: false});

      await store.dispatch('Groups/ADD_GROUP_USER', testName);

      expect(store.commit).toHaveBeenCalledTimes(2);
      expect(store.commit).toHaveBeenNthCalledWith(1, "Groups/fetching", undefined, undefined);
      expect(store.commit).toHaveBeenNthCalledWith(2, 'Groups/fetched', undefined, undefined);
      expect(store.commit).not.toHaveBeenCalledWith('Groups/receiveUpdate');
    });
  });

  describe('REMOVE_GROUP_USER(groupId, userId)', () => {

    test('calls api.groups.removeGroupUser()', async () => {
      const testResult = {success: true};
      api.removeGroupUser.mockReturnValueOnce(testResult);

      await store.dispatch('Groups/REMOVE_GROUP_USER', {groupId: testGroupId, userId: testUserId});

      expect(api.removeGroupUser).toHaveBeenCalledTimes(1);
      expect(api.removeGroupUser).toHaveBeenCalledWith(testGroupId, testUserId);
    });

    test('commits success.true mutations', async () => {
      const testResult = {success: true, messages: []};
      api.removeGroupUser.mockReturnValueOnce(testResult);

      await store.dispatch('Groups/REMOVE_GROUP_USER', testName);

      expect(store.commit).toHaveBeenCalledTimes(3);
      expect(store.commit).toHaveBeenNthCalledWith(1, "Groups/fetching", undefined, undefined);
      expect(store.commit).toHaveBeenNthCalledWith(2, 'Groups/fetched', undefined, undefined);
      expect(store.commit).toHaveBeenNthCalledWith(3, 'Groups/receiveUpdate', testResult, undefined);
    });

    test('commits success.false mutations', async () => {
      api.removeGroupUser.mockReturnValueOnce({success: false});

      await store.dispatch('Groups/REMOVE_GROUP_USER', testName);

      expect(store.commit).toHaveBeenCalledTimes(2);
      expect(store.commit).toHaveBeenNthCalledWith(1, "Groups/fetching", undefined, undefined);
      expect(store.commit).toHaveBeenNthCalledWith(2, 'Groups/fetched', undefined, undefined);
      expect(store.commit).not.toHaveBeenCalledWith('Groups/receiveUpdate');
    });
  });
});

describe('Mutations', () => {
  let initialState;

  beforeEach(() => {
    initialState = Object.assign({}, GroupsStore.state);
  });

  test('receiveGroups()', async () => {
    const testGroups = [1,2,3];
    expect(initialState.groups).toMatchObject([]);
    GroupsStore.mutations.receiveGroups(initialState, { groups: testGroups});
    expect(initialState.groups).toMatchObject(testGroups);
  });

  test('receiveUpdate()', async () => {
    const testMessages = ["1","2","3"];
    expect(initialState.messages).toMatchObject([]);
    GroupsStore.mutations.receiveUpdate(initialState, { messages: testMessages});
    expect(initialState.messages).toMatchObject(testMessages);
  });

  test('fetching', async () => {
    expect(initialState.fetching).toBe(null);
    GroupsStore.mutations.fetching(initialState);
    expect(initialState.fetching).toBe(true);
  });

  test('fetched', async () => {
    expect(initialState.fetching).toBe(null);
    GroupsStore.mutations.fetched(initialState);
    expect(initialState.fetching).toBe(false);
  });
});
