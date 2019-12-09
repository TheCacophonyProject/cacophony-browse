import CacophonyApi from "./CacophonyApi";

export default {
  addNewGroup,
  getGroups,
  addGroupUser,
  removeGroupUser
};

function addNewGroup(groupName) {
  return CacophonyApi.post("/api/v1/groups", { groupname: groupName });
}

function addGroupUser(groupName, userName, isAdmin) {
  return CacophonyApi.post("/api/v1/groups/users", {
    group: groupName,
    username: userName,
    admin: isAdmin
  });
}

function removeGroupUser(groupName, userName) {
  return CacophonyApi.delete("/api/v1/groups/users", {
    group: groupName,
    username: userName
  });
}

async function getGroups(groupname) {
  const where = JSON.stringify({ groupname: groupname });
  return CacophonyApi.get(`/api/v1/groups?where=${encodeURIComponent(where)}`);
}
