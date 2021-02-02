import CacophonyApi from "./CacophonyApi";

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

function getGroups() {
  return CacophonyApi.get(`/api/v1/groups?where=${encodeURIComponent("{}")}`);
}

function getGroupByName(groupName: string) {
  const where = JSON.stringify({ groupname: groupName });
  return CacophonyApi.get(`/api/v1/groups?where=${encodeURIComponent(where)}`);
}

function getStationsForGroup(groupName: string) {
  return CacophonyApi.get(
    `/api/v1/groups/${encodeURIComponent(groupName)}/stations`
  );
}

function addStationsToGroup(groupName: string, stations: { name: string, lat: number, lng: number }, applyFromDate: Date | null) {
  const payload: any = {
    group: groupName,
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
  getGroupByName,
  getStationsForGroup,
  addStationsToGroup,
  addGroupUser,
  removeGroupUser,
};
