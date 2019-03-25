jest.genMockFromModule('../../api/Device.api');
jest.mock('../../api/Device.api');
jest.mock("./../../api/fetch");

import api from '../../api/Device.api';
import DevicesStore from './Devices.store';

describe('Actions', () => {

  const
    testResult = {
      devices: {
        rows:
          [
            {devicename: 'a', id: 1},
            {devicename: 'b', id: 2}
          ]
      }
    },
    commit = jest.fn(),
    state = {
      currentDevice: testResult.devices[0],
      devices: testResult.devices
    };

  beforeEach(() => {
    api.getDevices.mockReturnValueOnce(testResult);
  });

  function _expectGetDevicesCalled(commit) {
    expect(api.getDevices).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledTimes(3);
    expect(commit).toHaveBeenNthCalledWith(1, 'fetching');
    expect(commit).toHaveBeenNthCalledWith(2, 'setCurrentDevice', testResult.devices[0]);
    expect(commit).toHaveBeenLastCalledWith('fetched');
  }

  describe('GET_DEVICES', () => {

    beforeEach(async () => {
      await DevicesStore.actions.GET_DEVICES({commit, state});
    });

    test('calls api.devices.getDevices()', () => {
      expect(api.getDevices).toHaveBeenCalledTimes(1);
      expect(api.getDevices.mock.calls).toMatchObject([[]]); //no params
    });

    test('commits correct mutations', () => {
      expect(commit).toHaveBeenCalledTimes(3);
      expect(commit).toHaveBeenNthCalledWith(1, "fetching");
      expect(commit).toHaveBeenNthCalledWith(2, 'receiveDevices', testResult.devices.rows);
      expect(commit).toHaveBeenNthCalledWith(3, 'fetched');
    });
  });

  describe('ADD_USER', () => {
    const testObject = {username: 'x', device: {id: 1}, admin: true};
    beforeEach(async () => {
      await DevicesStore.actions.ADD_USER({commit, state}, testObject);
    });

    test('calls api.devices.addUser()', async () => {
      expect(api.addUserToDevice).toHaveBeenCalledTimes(1);
      expect(api.addUserToDevice).toHaveBeenCalledWith(testObject.username, testObject.device.id, testObject.admin);
    });

    test('calls _getDevice(devicename, commit, state)', async () => {
      _expectGetDevicesCalled(commit);
    });
  });

  describe('REMOVE_USER', () => {

    const testObject = {device: {id: 21}, userName: "Bob"};

    beforeEach(async () => {
      await DevicesStore.actions.REMOVE_USER({commit, state}, testObject);
    });

    test('calls api.devices.removeDeviceUser()', async () => {
      expect(api.removeUserFromDevice).toHaveBeenCalledTimes(1);
      expect(api.removeUserFromDevice).toHaveBeenCalledWith("Bob", 21);
    });

    test('calls _getDevice(devicename, commit, state)', async () => {
      _expectGetDevicesCalled(commit);
    });
  });
});

describe('Mutations', () => {
  let initialState;

  beforeEach(() => {
    initialState = Object.assign({}, DevicesStore.state);
  });

  test('receiveDevices()', () => {
    const testDevices = [1, 2, 3];
    expect(initialState.devices).toMatchObject([]);
    DevicesStore.mutations.receiveDevices(initialState, testDevices);
    expect(initialState.devices).toMatchObject(testDevices);
  });

  test('receiveCurrentDevice()', () => {
    const testDevice = {};
    expect(initialState.currentDevice).toBeNull();
    DevicesStore.mutations.setCurrentDevice(initialState, testDevice);
    expect(initialState.currentDevice).toMatchObject(testDevice);
  });

  test('fetching / fetched', () => {
    expect(initialState.fetched).toBe(false);
    DevicesStore.mutations.fetched(initialState);
    expect(initialState.fetched).toBe(true);
    DevicesStore.mutations.fetching(initialState);
    expect(initialState.fetched).toBe(false);
  });
});
