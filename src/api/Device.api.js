import { fetch } from './fetch';

export default {
  getDevices,
  addUserToDevice,
  removeUserFromDevice
};

const devicesApiUrl = `${ENV.api}/api/v1/devices`;
const deviceUsersApiUrl = `${ENV.api}/api/v1/devices/users`;

function getDevices() {

  return fetch(
    devicesApiUrl,
    {
      method:"GET"
    });
}

function addUserToDevice(username, deviceId, admin) {

  const body = `userId=${encodeURIComponent(username)}&deviceId=${encodeURIComponent(deviceId)}&admin=${admin}`;

  return fetch(
    deviceUsersApiUrl,
    {
      method:"POST",
      body,
      headers: {
        'Content-Type':'application/x-www-form-urlencoded; charset=utf-8'
      }
    }
  );
}

function removeUserFromDevice(username, deviceId) {

  const body = `userId=${username}&deviceId=${deviceId}`;

  return fetch(
    deviceUsersApiUrl,
    {
      method:"DELETE",
      body,
      headers: {
        'Content-Type':'application/x-www-form-urlencoded; charset=utf-8'
      }
    }
  );
}
