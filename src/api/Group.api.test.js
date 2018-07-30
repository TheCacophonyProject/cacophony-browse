import crossFetch from 'cross-fetch'; // mocked __mocks__/cross-fetch.js
import groupApi from './Groups.api';

test('addGroup(groupname, JWT) calls api via fetch', async () => {
  const testGroupName = 'testGroupname';
  const testJWT = 'testJWT';

  await groupApi.addNewGroup(testGroupName, testJWT);

  const calls = crossFetch.default.mock.calls;
   expect(calls).toHaveLength(1);
   expect(calls[0][0]).toBe('http://mocked-api-path/api/v1/groups');
   expect(calls[0][1].method).toBe('POST');
   expect(calls[0][1].body).toBe(`groupname=${testGroupName}`);
   expect(calls[0][1].headers['Content-Type']).toBe('application/x-www-form-urlencoded; charset=utf-8');
   expect(calls[0][1].headers['Authorization']).toBe('testJWT');
   expect(Object.entries(calls[0][1].headers)).toHaveLength(2);
});

test('addGroupUser(groupId, userName, isAdmin, JWT) calls api via fetch', async () => {
  const testGroupId = 'testGroupId';
  const testUserName = 'testUserName';
  const testBoolAdmin = 'testUserName';
  const testJWT = 'testJWT';

  await groupApi.addGroupUser(testGroupId, testUserName, testBoolAdmin, testJWT);

  const calls = crossFetch.default.mock.calls;
  expect(calls).toHaveLength(1);
  expect(calls[0][0]).toBe('http://mocked-api-path/api/v1/groups/users');
  expect(calls[0][1].method).toBe('POST');
  expect(calls[0][1].body).toBe(`groupId=${testGroupId}&userId=${testUserName}&admin=${testBoolAdmin}`);
  expect(calls[0][1].headers['Content-Type']).toBe('application/x-www-form-urlencoded; charset=utf-8');
  expect(calls[0][1].headers['Authorization']).toBe('testJWT');
  expect(Object.entries(calls[0][1].headers)).toHaveLength(2);
});

test('removeGroupUser(groupId, userId, JWT) calls api via fetch', async () => {
  const testGroupId = 'testGroupId';
  const testUserId = 'testUserId';
  const testJWT = 'testJWT';

  await groupApi.removeGroupUser(testGroupId, testUserId, testJWT);

  const calls = crossFetch.default.mock.calls;
  expect(calls).toHaveLength(1);
  expect(calls[0][0]).toBe('http://mocked-api-path/api/v1/groups/users');
  expect(calls[0][1].method).toBe('DELETE');
  expect(calls[0][1].body).toBe(`groupId=${testGroupId}&userId=${testUserId}`);
  expect(calls[0][1].headers['Content-Type']).toBe('application/x-www-form-urlencoded; charset=utf-8');
  expect(calls[0][1].headers['Authorization']).toBe('testJWT');
  expect(Object.entries(calls[0][1].headers)).toHaveLength(2);

});

test('getGroups(groupname, JWT) calls api via fetch', async () => {
  const testGroupName = 'testGroupName';
  const testJWT = 'testJWT';

  await groupApi.getGroups(testGroupName, testJWT);

  const calls = crossFetch.default.mock.calls;
  expect(calls).toHaveLength(1);
  expect(calls[0][0]).toBe(`http://mocked-api-path/api/v1/groups?where={"groupname":"${testGroupName}"}`);
  expect(calls[0][1].method).toBe('GET');
  expect(calls[0][1].body).toBe(undefined);
  expect(calls[0][1].headers['Content-Type']).toBe('application/x-www-form-urlencoded; charset=utf-8');
  expect(calls[0][1].headers['Authorization']).toBe('testJWT');
  expect(Object.entries(calls[0][1].headers)).toHaveLength(2);
});
