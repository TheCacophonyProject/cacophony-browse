import { Config } from '../../app.config';
import { authorisedFetch } from './fetch';

export default {
  addNewGroup,
  getGroups,
  addGroupUser,
  removeGroupUser
};

function addNewGroup(groupName) {
  const body = `groupname=${encodeURIComponent(groupName)}`;

  return authorisedFetch(
    `${Config.api}/api/v1/groups`,
    {
      method: "POST",
      body: body,
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      }
    }
  );
}

function addGroupUser(groupId, userName, isAdmin) {
  const body = `groupId=${encodeURIComponent(groupId)}&userId=${encodeURIComponent(userName)}&admin=${encodeURIComponent(isAdmin)}`;

  return authorisedFetch(
    `${Config.api}/api/v1/groups/users`,
    {
      method: "POST",
      body: body,
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      }
    }
  );
}

function removeGroupUser(groupId, userId) {
  const body = `groupId=${encodeURIComponent(groupId)}&userId=${encodeURIComponent(userId)}`;

  return authorisedFetch(
    `${Config.api}/api/v1/groups/users`,
    {
      method: "DELETE",
      body: body,
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      }
    }
  );
}

async function getGroups(groupname) {
  const where = JSON.stringify({groupname});
  const body = `where=${where}`;

  return await authorisedFetch(
    `${Config.api}/api/v1/groups?${body}`,
    {
      method: "GET",
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      }
    }
  );
}
