import config from "../config";
import { fetch } from "./fetch";

export default {
  getDevices,
  addUserToDevice,
  removeUserFromDevice
};

function getDevices() {
  return fetch(`${config.api}/api/v1/devices`, { method: "GET" });
}

function addUserToDevice(username, deviceId, admin) {
  const body = `username=${encodeURIComponent(
    username
  )}&deviceId=${encodeURIComponent(deviceId)}&admin=${admin}`;

  return fetch(`${config.api}/api/v1/devices/users`, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    }
  });
}

function removeUserFromDevice(username, deviceId) {
  const body = `username=${username}&deviceId=${deviceId}`;

  return fetch(`${config.api}/api/v1/devices/users`, {
    method: "DELETE",
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    }
  });
}
