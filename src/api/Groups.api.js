import fetch from 'cross-fetch';
import { Config } from '../../app.config'; // eslint-disable-line

export default {
  addNewGroup,
  getGroups,
  addGroupUser,
  removeGroupUser
};

function addNewGroup(groupName, JWT) {
  const body = `groupname=${encodeURIComponent(groupName)}`;

  return fetch(
    `${Config.api}/api/v1/groups`,
    {
      method: "POST",
      body: body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Authorization': JWT
      }
    }
  );
}

function addGroupUser(groupId, userName, isAdmin, JWT) {
  const body = `groupId=${encodeURIComponent(groupId)}&userId=${encodeURIComponent(userName)}&admin=${encodeURIComponent(isAdmin)}`;

  return fetch(
    `${Config.api}/api/v1/groups/users`,
    {
      method: "POST",
      body: body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Authorization': JWT
      }
    }
  );
}

function removeGroupUser(groupId, userId, JWT) {
  const body = `groupId=${encodeURIComponent(groupId)}&userId=${encodeURIComponent(userId)}`;

  return fetch(
    `${Config.api}/api/v1/groups/users`,
    {
      method: "DELETE",
      body: body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Authorization': JWT
      }
    }
  );
}

function getGroups(groupname, JWT) {
  const where = JSON.stringify({groupname});
  const body = `where=${where}`;

  return fetch(
    `${Config.api}/api/v1/groups?${body}`,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Authorization': JWT
      }
    }
  );
}
