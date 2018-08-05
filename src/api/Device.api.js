import { Config } from '../../app.config';
import { authorisedFetch } from './fetch';

export default {
  getDevices,
  addUserToDevice,
  removeUserFromDevice
};

const devicesApiUrl = Config.api + '/api/v1/devices';
const deviceUsersApiUrl = Config.api + '/api/v1/devices/users';

function getDevices() {

  return authorisedFetch(
    devicesApiUrl,
    {
      method:"GET",
      cache: "no-cache",
    });
}

function addUserToDevice(username, deviceId, admin) {

  const body = `userId=${encodeURIComponent(username)}&deviceId=${encodeURIComponent(deviceId)}&admin=${admin}`;

  return authorisedFetch(
    deviceUsersApiUrl,
    {
      method:"POST",
      body,
      headers: {
        'Content-Type':'application/x-www-form-urlencoded; charset=utf-8'
      },
      cache: "no-cache",
    }
  );
}

function removeUserFromDevice(username, deviceId) {

  const body = `userId=${username}&deviceId=${deviceId}`;

  return authorisedFetch(
    deviceUsersApiUrl,
    {
      method:"DELETE",
      body,
      headers: {
        'Content-Type':'application/x-www-form-urlencoded; charset=utf-8'
      },
      cache: "no-cache",
    }
  );
}
