jest.mock("./fetch");
import { fetch } from "./fetch";
import devicesApi from './Device.api';
import querystring from 'querystring';

describe('getDevices() calls fetch', () => {
  test('with the correct request params', async () => {
    await devicesApi.getDevices();
    expect(fetch.mock.calls[0]).toHaveLength(2);
    expect(fetch.mock.calls[0][1]).toMatchObject(
      {
        method: 'GET'
      }
    );
  });

  test('with the correct path', async () => {
    await devicesApi.getDevices();
    expect(fetch.mock.calls[0][0]).toBe(`http://mocked-api-path/api/v1/devices`);
  });

  test('just once', async () => {
    await devicesApi.getDevices();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

});
describe('addUserToDevice() calls fetch', () => {

  test('with the correct path', async () => {
    await devicesApi.addUserToDevice();
    expect(fetch.mock.calls[0][0]).toBe(`http://mocked-api-path/api/v1/devices/users`);
  });

  test('with the correct request params', async () => {
    const
      testUserId = 123456,
      testDeviceId = 654321,
      testIsAdmin = true;

    await devicesApi.addUserToDevice(testUserId, testDeviceId, testIsAdmin);
    expect(fetch.mock.calls[0]).toHaveLength(2);
    expect(fetch.mock.calls[0][1]).toMatchObject(
      {
        method: 'POST',
        body: querystring.stringify({userId: testUserId, deviceId: testDeviceId, admin: testIsAdmin}),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
      }
    );
  });

  test('just once', async () => {
    await devicesApi.addUserToDevice();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

});
describe('removeUserFromDevice() calls fetch', () => {

  test('with the correct path', async () => {
    await devicesApi.removeUserFromDevice();
    expect(fetch.mock.calls[0][0]).toBe(`http://mocked-api-path/api/v1/devices/users`);
  });

  test('with the correct request params', async () => {
    const
      testUserId = 123456,
      testDeviceId = 654321;

    await devicesApi.removeUserFromDevice(testUserId, testDeviceId);
    expect(fetch.mock.calls[0]).toHaveLength(2);
    expect(fetch.mock.calls[0][1]).toMatchObject(
      {
        method: 'DELETE',
        body: querystring.stringify({userId: testUserId, deviceId: testDeviceId}),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
      }
    );
  });

  test('just once', async () => {
    await devicesApi.removeUserFromDevice();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
