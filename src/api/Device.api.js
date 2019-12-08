import CacophonyApi from "./CacophonyApi";

export default {
  getDevices,
  addUserToDevice,
  removeUserFromDevice
};

function getDevices() {
  return CacophonyApi.get("/api/v1/devices");
}

function addUserToDevice(username, deviceId, admin) {
  return CacophonyApi.post("/api/v1/devices/users", {
    username: username,
    deviceId: deviceId,
    admin: admin
  });
}

function removeUserFromDevice(username, deviceId) {
  return CacophonyApi.delete("/api/v1/devices/users", {
    username: username,
    deviceId: deviceId
  });
}
