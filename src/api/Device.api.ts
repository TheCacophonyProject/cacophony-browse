import CacophonyApi from "./CacophonyApi";
import * as querystring from "querystring";
export default {
  getDevices,
  addUserToDevice,
  removeUserFromDevice,
  getLatestSoftwareVersion,
  getLatestEvents,
};

function getDevices() {
  return CacophonyApi.get("/api/v1/devices");
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
  const params: EventApiParams = {
    limit: 1,
    type: "versionData",
  };
  return getLatestEvents(deviceId, params);
}

export interface EventApiParams {
  limit?: number;
  offset?: number;
  type?: string;
  endTime?: string;
}

function getLatestEvents(deviceId, params?: EventApiParams) {
  return CacophonyApi.get(
    `/api/v1/events?latest=true&deviceId=${deviceId}&${querystring.stringify(
      params as any
    )}`
  );
}
