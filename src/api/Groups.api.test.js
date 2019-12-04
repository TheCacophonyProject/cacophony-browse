jest.mock("./fetch");

import groupApi from "./Groups.api";
import { fetch } from "./fetch";
import querystring from "querystring";

describe("addGroup(groupName) calls authenticatedFetch", () => {
  test("with the correct path", async () => {
    await groupApi.addNewGroup();
    expect(fetch.mock.calls[0][0]).toBe("http://mocked-api-path/api/v1/groups");
  });

  test("with the correct request params", async () => {
    const testGroupName = "some groupname";

    await groupApi.addNewGroup(testGroupName);

    expect(fetch.mock.calls[0]).toHaveLength(2);
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ groupname: testGroupName }),
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  });

  test("just once", async () => {
    await groupApi.addNewGroup();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("addGroupUser(groupName, userName, isAdmin) calls authenticatedFetch", () => {
  test("with the correct path", async () => {
    await groupApi.addGroupUser();
    expect(fetch.mock.calls[0][0]).toBe(
      "http://mocked-api-path/api/v1/groups/users"
    );
  });

  test("with the correct request params", async () => {
    const testGroup = "some group",
      testUserName = "some userName",
      testBoolAdmin = true;

    await groupApi.addGroupUser(testGroup, testUserName, testBoolAdmin);

    expect(fetch.mock.calls[0]).toHaveLength(2);
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({
        group: testGroup,
        username: testUserName,
        admin: testBoolAdmin
      }),
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  });

  test("just once", async () => {
    await groupApi.addGroupUser();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("removeGroupUser(groupName,username) calls authenticatedFetch", () => {
  test("with the correct path", async () => {
    await groupApi.removeGroupUser();
    expect(fetch.mock.calls[0][0]).toBe(
      "http://mocked-api-path/api/v1/groups/users"
    );
  });

  test("with the correct request params", async () => {
    const testGroup = "some group",
      testUserName = "some userName";

    await groupApi.removeGroupUser(testGroup, testUserName);

    expect(fetch.mock.calls[0]).toHaveLength(2);
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: "DELETE",
      body: JSON.stringify({ group: testGroup, username: testUserName }),
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  });

  test("just once", async () => {
    await groupApi.removeGroupUser();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("getGroups(groupName) calls authenticatedFetch", () => {
  test("with the correct path (no param)", async () => {
    await groupApi.getGroups();
    expect(fetch.mock.calls[0][0]).toBe(
      `http://mocked-api-path/api/v1/groups?where=${encodeURIComponent("{}")}`
    );
  });

  test("with correctly formatted query string", async () => {
    const params = {
      testGroupId: 123456
    };

    await groupApi.getGroups(params);

    const query = fetch.mock.calls[0][0].split("?")[1];

    const parsedString = querystring.parse(query);
    expect(parsedString).toMatchObject({
      where: `{\"groupname\":${JSON.stringify(params)}}`
    });
  });

  test("with the correct request params", async () => {
    await groupApi.getGroups();

    expect(fetch.mock.calls[0]).toHaveLength(2);
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: "GET"
    });
  });

  test("just once", async () => {
    await groupApi.getGroups();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
