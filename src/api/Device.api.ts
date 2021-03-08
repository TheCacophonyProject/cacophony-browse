import CacophonyApi from "./CacophonyApi";
import { shouldViewAsSuperUser } from "@/utils";

export default {
  getDevices,
  getDevice,
  addUserToDevice,
  removeUserFromDevice,
  getLatestSoftwareVersion,
};

function getDevices() {
  return CacophonyApi.get(
    `/api/v1/devices${shouldViewAsSuperUser() ? "" : "?view-mode=limited"}`
  );
}

function getDevice(deviceNameOrId: string | number) {
  return CacophonyApi.get(
    `/api/v1/devices/${encodeURIComponent(deviceNameOrId)}`
  );
}

function addUserToDevice(username, deviceId, admin) {
  const suppressGlobalMessaging = true;

  return CacophonyApi.post(
    "/api/v1/devices/users",
    {
      username: username,
      deviceId: deviceId,
      admin: admin,
    },
    suppressGlobalMessaging
  );
}

function removeUserFromDevice(username, deviceId) {
  return CacophonyApi.delete("/api/v1/devices/users", {
    username: username,
    deviceId: deviceId,
  });
}

function getLatestSoftwareVersion(deviceId) {
  return CacophonyApi.get(
    `/api/v1/events?type=versionData&limit=1&latest=true&deviceId=${deviceId}`
  );
}
