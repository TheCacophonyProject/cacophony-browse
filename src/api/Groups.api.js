import fetch from 'cross-fetch';
import { Config } from '../../app.config'; // eslint-disable-line

export default {
  newGroup,
  getGroups,
  addGroupUser,
  removeGroupUser
};

function newGroup() {

// TODO Move to store/Groups action
//	if (!user.isLoggedIn()) {
//		window.alert('Please log in before making a new group');
//		return;
//	}

//	var groupname = document.getElementById('group-name').value;
//
//	if (!groupname) {
//		window.alert('invalid group name');
//		return;
//	}
//
//	$.ajax({
//		url: api + '/api/v1/groups',
//		type: 'post',
//		data: 'groupname=' + groupname,
//		headers: { 'Authorization': user.getJWT() },
//		success: user.updateUserData,
//		error: newGroupError
//	});
}

function addGroupUser(groupId, userName, isAdmin, JWT) {
  let body = `groupId=${encodeURIComponent(groupId)}&userId=${encodeURIComponent(userName)}&admin=${encodeURIComponent(isAdmin)}`;

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
  let body = `groupId=${encodeURIComponent(groupId)}&userId=${encodeURIComponent(userId)}`;

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

  let body = `where=${where}`;

  return fetch(
    `${Config.api}/api/v1/Groups?${body}`,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Authorization': JWT
      }
    }
  );
}
