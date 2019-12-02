jest.mock("./fetch");

import userApi from "./User.api";
import { fetch } from "./fetch";
import querystring from "querystring";

describe("login(groupname) calls fetch", () => {
  test("with the correct path", async () => {
    await userApi.login();
    expect(fetch.mock.calls[0][0]).toBe(
      "http://mocked-api-path/authenticate_user"
    );
  });

  test("just once", async () => {
    await userApi.login();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("login(username,password) calls api via fetch", async () => {
    const testUsername = "testu";
    const testPassword = "testp";

    await userApi.login(testUsername, testPassword);

    const calls = fetch.mock.calls;
    expect(calls).toHaveLength(1);
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: "POST",
      body: querystring.stringify({
        nameOrEmail: testUsername,
        password: testPassword
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
      }
    });
  });

  describe("local storage", () => {
    const testUsername = "testu";
    const testJWT = "testJWT";

    beforeEach(() => {
      userApi.persistUser(testUsername, testJWT);
    });

    test("persist(username,token) stores username and JWT to localStorage", () => {
      expect(localStorage.getItem("username")).toBe(testUsername);
      expect(localStorage.getItem("JWT")).toBe(testJWT);
    });

    test("logout() clears localStorage values", () => {
      expect(localStorage.getItem("username")).toBe(testUsername);
      expect(localStorage.getItem("JWT")).toBe(testJWT);

      userApi.logout();

      expect(localStorage.getItem("username")).toBe(null);
      expect(localStorage.getItem("JWT")).toBe(null);
    });
  });
});

describe("register(username,password,email) calls fetch", () => {
  test("with the correct path", async () => {
    await userApi.register();
    expect(fetch.mock.calls[0][0]).toBe("http://mocked-api-path/api/v1/Users");
  });

  test("just once", async () => {
    await userApi.register();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("register(username,password) calls api via fetch", async () => {
    const testUsername = "testu";
    const testPassword = "testp";
    const testEmail = "teste";
    const testEndUserAgreement = 3;
    await userApi.register(testUsername, testPassword, testEmail, testEndUserAgreement);

    const calls = fetch.mock.calls;
    expect(calls).toHaveLength(1);
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: "POST",
      body: querystring.stringify({
        username: testUsername,
        password: testPassword,
        endUserAgreement: testEndUserAgreement,
        email: testEmail
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
      }
    });
  });
});
