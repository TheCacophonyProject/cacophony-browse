jest.mock("./fetch");

import groupApi from './Groups.api';
import {authorisedFetch} from "./fetch";
import querystring from 'querystring';


describe('addGroup(groupname) calls authenticatedFetch', () => {

  test('with the correct path', async () => {
    await groupApi.addNewGroup();
    expect(authorisedFetch.mock.calls[0][0]).toBe('http://mocked-api-path/api/v1/groups');
  });

  test('with the correct request params', async () => {
    const
      testGroupName = "some groupname";

    await groupApi.addNewGroup(testGroupName);

    expect(authorisedFetch.mock.calls[0]).toHaveLength(2);
    expect(authorisedFetch.mock.calls[0][1]).toMatchObject(
      {
        method: 'POST',
        cache: 'no-cache',
        body: querystring.stringify({groupname: testGroupName}),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
      }
    );
  });

  test('just once', async () => {
    await groupApi.addNewGroup();
    expect(authorisedFetch).toHaveBeenCalledTimes(1);
  });

});

describe('addGroupUser(groupId, userName, isAdmin) calls authenticatedFetch', () => {

  test('with the correct path', async () => {
    await groupApi.addGroupUser();
    expect(authorisedFetch.mock.calls[0][0]).toBe('http://mocked-api-path/api/v1/groups/users');
  });

  test('with the correct request params', async () => {
    const
      testGroupId = "some groupId",
      testUserName = "some userName",
      testBoolAdmin = true;

    await groupApi.addGroupUser(testGroupId, testUserName, testBoolAdmin);

    expect(authorisedFetch.mock.calls[0]).toHaveLength(2);
    expect(authorisedFetch.mock.calls[0][1]).toMatchObject(
      {
        method: 'POST',
        cache: 'no-cache',
        body: querystring.stringify({groupId: testGroupId, userId: testUserName, admin: testBoolAdmin}),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
      }
    );
  });

  test('just once', async () => {
    await groupApi.addGroupUser();
    expect(authorisedFetch).toHaveBeenCalledTimes(1);
  });
});

describe('removeGroupUser(groupId, userId) calls authenticatedFetch', () => {

  test('with the correct path', async () => {
    await groupApi.removeGroupUser();
    expect(authorisedFetch.mock.calls[0][0]).toBe('http://mocked-api-path/api/v1/groups/users');
  });

  test('with the correct request params', async () => {
    const
      testGroupId = "some groupId",
      testUserName = "some userName";

    await groupApi.removeGroupUser(testGroupId, testUserName);

    expect(authorisedFetch.mock.calls[0]).toHaveLength(2);
    expect(authorisedFetch.mock.calls[0][1]).toMatchObject(
      {
        method: 'DELETE',
        cache: 'no-cache',
        body: querystring.stringify({groupId: testGroupId, userId: testUserName}),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
      }
    );
  });


  test('just once', async () => {
    await groupApi.removeGroupUser();
    expect(authorisedFetch).toHaveBeenCalledTimes(1);
  });
});

describe('getGroups(groupname) calls authenticatedFetch', () => {

  test('with the correct path (no param)', async () => {
    await groupApi.getGroups();
    expect(authorisedFetch.mock.calls[0][0]).toBe('http://mocked-api-path/api/v1/groups?where={}');
  });

  test('with correctly formatted query string', async () =>{
    const params = {
      testGroupId: 123456
    };

    await groupApi.getGroups(params);

    const query = authorisedFetch.mock.calls[0][0].split('?')[1];

    const parsedString = querystring.parse(query);
    expect(parsedString).toMatchObject(
      {
        "where": `{\"groupname\":${ JSON.stringify(params) }}`
      }
    );

  });

  test('with the correct request params', async () => {

    await groupApi.getGroups();

    expect(authorisedFetch.mock.calls[0]).toHaveLength(2);
    expect(authorisedFetch.mock.calls[0][1]).toMatchObject(
      {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
      }
    );
  });

  test('just once', async () => {
    await groupApi.getGroups();
    expect(authorisedFetch).toHaveBeenCalledTimes(1);
  });
});
