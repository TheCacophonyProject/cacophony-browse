import CacophonyApi from "./CacophonyApi";
import { shouldViewAsSuperUser } from "@/utils";

function addNewGroup(groupName) {
  const suppressGlobalMessaging = true;
  return CacophonyApi.post(
    "/api/v1/groups",
    { groupname: groupName },
    suppressGlobalMessaging
  );
}

function addGroupUser(
  groupName,
  userName,
  isAdmin
): { success: boolean; status: number } {
  const suppressGlobalMessaging = true;
  return CacophonyApi.post(
    "/api/v1/groups/users",
    {
      group: groupName,
      username: userName,
      admin: isAdmin,
    },
    suppressGlobalMessaging
  );
}

function removeGroupUser(groupName, userName) {
  return CacophonyApi.delete("/api/v1/groups/users", {
    group: groupName,
    username: userName,
  });
}

function getGroup(groupName: string) {
  const where = JSON.stringify({ groupname: groupName });
  return CacophonyApi.get(`/api/v1/groups?where=${encodeURIComponent(where)}`);
}

function getGroups() {
  return CacophonyApi.get(
    `/api/v1/groups${shouldViewAsSuperUser() ? "" : "?view-mode=limited"}`
  );
}

function getUsersForGroup(groupNameOrId: string | number) {
  return CacophonyApi.get(
    `/api/v1/groups/${encodeURIComponent(groupNameOrId)}/users`
  );
}

function getDevicesForGroup(groupNameOrId: string | number) {
  return CacophonyApi.get(
    `/api/v1/groups/${encodeURIComponent(groupNameOrId)}/devices`
  );
}

function getStationsForGroup(groupNameOrId: string) {
  return CacophonyApi.get(
    `/api/v1/groups/${encodeURIComponent(groupNameOrId)}/stations`
  );
}

function addStationsToGroup(
  groupName: string | number,
  stations: { name: string; lat: number; lng: number },
  applyFromDate?: Date
) {
  const payload: {
    stations: string;
    fromDate?: string;
  } = {
    stations: JSON.stringify(stations),
  };
  if (applyFromDate) {
    payload.fromDate = applyFromDate.toISOString();
  }
  return CacophonyApi.post(
    `/api/v1/groups/${encodeURIComponent(groupName)}/stations`,
    payload
  );
}

export default {
  addNewGroup,
  getGroups,
  getGroup,
  getUsersForGroup,
  getDevicesForGroup,
  getStationsForGroup,
  addStationsToGroup,
  addGroupUser,
  removeGroupUser,
};
