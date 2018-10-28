jest.genMockFromModule('../../api/Groups.api');
jest.mock('../../api/Groups.api');
jest.mock("./../../api/fetch");

import api from '../../api/Groups.api';
import GroupsStore from './Groups.store';

describe('Actions', () => {

  const
    testResult = {
      groups: [
        {groupname: 'a'},
        {groupname: 'b'}
      ]
    },
    commit = jest.fn(),
    state = {
      currentGroup: testResult.groups[0],
      groups: testResult.groups
    };

  beforeEach(() => {
    api.getGroups.mockReturnValueOnce(testResult);
  });

  function _expectGetGroupsCalled(commit) {
    expect(api.getGroups).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledTimes(4);
    expect(commit).toHaveBeenNthCalledWith(1, 'fetching');
    expect(commit).toHaveBeenNthCalledWith(2, 'setCurrentGroup', testResult.groups[0]);
    expect(commit).toHaveBeenNthCalledWith(3, 'receiveGroups', testResult.groups);
    expect(commit).toHaveBeenLastCalledWith('fetched');
  }

  describe('GET_GROUPS', () => {

    beforeEach(async () => {
      await GroupsStore.actions.GET_GROUPS({commit, state});
    });

    test('calls api.groups.getGroups()', () => {
      expect(api.getGroups).toHaveBeenCalledTimes(1);
      expect(api.getGroups.mock.calls).toMatchObject([[]]); //no params
    });

    test('commits correct mutations', () => {
      expect(commit).toHaveBeenCalledTimes(3);
      expect(commit).toHaveBeenNthCalledWith(1, "fetching");
      expect(commit).toHaveBeenNthCalledWith(2, 'receiveGroups', testResult.groups);
      expect(commit).toHaveBeenNthCalledWith(3, 'fetched');
    });
  });

  describe('ADD_GROUP', async () => {

    const testString = "some string";
    api.addNewGroup.mockReturnValueOnce();

    beforeEach(async () => {
      await GroupsStore.actions.ADD_GROUP({commit, state}, testString);
    });

    test('calls api.groups.addNewGroup()', async () => {
      expect(api.addNewGroup).toHaveBeenCalledTimes(1);
      expect(api.addNewGroup).toHaveBeenCalledWith(testString);
    });

    test('calls _getGroup(groupName, commit, state)', async () => {
      _expectGetGroupsCalled(commit);
    });
  });

  describe('ADD_GROUP_USER', async () => {
    const testObject = {groupName: 'x', userName: "y", isAdmin: "z"};
    beforeEach(async () => {
      await GroupsStore.actions.ADD_GROUP_USER({commit, state}, testObject);
    });

    test('calls api.groups.addGroupUser()', async () => {
      expect(api.addGroupUser).toHaveBeenCalledTimes(1);
      expect(api.addGroupUser).toHaveBeenCalledWith(testObject.groupName, testObject.userName, testObject.isAdmin);
    });

    test('calls _getGroup(groupname, commit, state)', async () => {
      _expectGetGroupsCalled(commit);
    });
  });

  describe('REMOVE_GROUP_USER', async () => {

    const testObject = {groupName: 'x', userName: "y"};

    beforeEach(async () => {
      await GroupsStore.actions.REMOVE_GROUP_USER({commit, state}, testObject);
    });

    test('calls api.groups.removeGroupUser()', async () => {
      expect(api.removeGroupUser).toHaveBeenCalledTimes(1);
      expect(api.removeGroupUser).toHaveBeenCalledWith(testObject.groupName, testObject.userName);
    });

    test('calls _getGroup(groupName, commit, state)', async () => {
      _expectGetGroupsCalled(commit);
    });
  });
});

describe('Mutations', () => {
  let initialState;

  beforeEach(() => {
    initialState = Object.assign({}, GroupsStore.state);
  });

  test('receiveGroups()', () => {
    const testGroups = [1, 2, 3];
    expect(initialState.groups).toMatchObject([]);
    GroupsStore.mutations.receiveGroups(initialState, testGroups);
    expect(initialState.groups).toMatchObject(testGroups);
  });

  test('receiveCurrentGroup()', () => {
    const testGroup = {};
    expect(initialState.currentGroup).toBeNull();
    GroupsStore.mutations.setCurrentGroup(initialState, testGroup);
    expect(initialState.currentGroup).toMatchObject(testGroup);
  });

  test('fetching / fetched', () => {
    expect(initialState.fetched).toBe(false);
    GroupsStore.mutations.fetched(initialState);
    expect(initialState.fetched).toBe(true);
    GroupsStore.mutations.fetching(initialState);
    expect(initialState.fetched).toBe(false);
  });
});
