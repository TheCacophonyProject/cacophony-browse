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

function getDevice(groupName: string, deviceName: string) {
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

export const DeviceEventTypes = [
  "alert",
  "attiny-sleep",
  "audioBait",
  "daytime-power-off",
  "powered-off",
  "power-on-test",
  "rpi-power-on",
  "salt-update",
  "systemError",
  "test",
  "throttle",
  "versionData",
] as const;

type IsoFormattedString = string;

export type DeviceEvent = typeof DeviceEventTypes[number];

export interface EventApiParams {
  limit?: number;
  offset?: number;
  type?: DeviceEvent | DeviceEvent[];
  endTime?: IsoFormattedString; // Or in the format YYYY-MM-DD hh:mm:ss
  startTime?: IsoFormattedString;
}

function getLatestEvents(deviceId, params?: EventApiParams) {
  return CacophonyApi.get(
    `/api/v1/events?latest=true&deviceId=${deviceId}&${querystring.stringify(
      params as any
    )}`
  );
}
