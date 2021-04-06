import CacophonyApi from "./CacophonyApi";
import * as querystring from "querystring";
import { shouldViewAsSuperUser } from "@/utils";

export default {
  getDevices,
  getDevice,
  addUserToDevice,
  removeUserFromDevice,
  getLatestSoftwareVersion,
  getLatestEvents,
};

export interface DeviceInfo {
  deviceName: string;
  groupName: string;
  id: number;
  users?: UserDetails;
}

export interface UserDetails {
  userName: string;
  id: number;
  admin: boolean;
}

function getDevices() {
  return CacophonyApi.get(
    `/api/v1/devices${shouldViewAsSuperUser() ? "" : "?view-mode=user"}`
  );
}

function getDevice(groupName: string, deviceName: string): Promise<DeviceInfo> {
  return CacophonyApi.get(
    `/api/v1/devices/${deviceName}/in-group/${groupName}`
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
