import crossFetch from 'cross-fetch'; // mocked __mocks__/cross-fetch.js
import userApi from './User.api';
import {LocalStorageMock} from '../tests/testUtils';

global.localStorage = new LocalStorageMock();

test('login(username,password) calls api via fetch', async () => {
  const testUsername = 'testu';
  const testPassword = 'testp';

  await userApi.login(testUsername, testPassword);

  const calls = crossFetch.default.mock.calls;
  expect(calls).toHaveLength(1);
  expect(calls[0][0]).toBe('http://mocked-api-path/authenticate_user');
  expect(calls[0][1].method).toBe('POST');
  expect(calls[0][1].body).toBe(`username=${testUsername}&password=${testPassword}`);
  expect(calls[0][1].headers['Content-Type']).toBe('application/x-www-form-urlencoded; charset=utf-8');
  expect(Object.entries(calls[0][1].headers)).toHaveLength(1);
});

describe('local storage', () => {

  const testUsername = 'testu';
  const testJWT = 'testJWT';

  beforeEach(() => {
    userApi.persistUser(testUsername, testJWT);
  });

  test('persist(username,token) stores username and JWT to localStorage', () => {
    expect(localStorage.getItem('username')).toBe(testUsername);
    expect(localStorage.getItem('JWT')).toBe(testJWT);
  });

  test('logout() clears localStorage values', () => {
    expect(localStorage.getItem('username')).toBe(testUsername);
    expect(localStorage.getItem('JWT')).toBe(testJWT);

    userApi.logout();

    expect(localStorage.getItem('username')).toBe(null);
    expect(localStorage.getItem('JWT')).toBe(null);
  });
});

test('register(username,password) calls api via fetch', async () => {
  const testUsername = 'testu';
  const testPassword = 'testp';
  await userApi.register(testUsername, testPassword);

  const calls = crossFetch.default.mock.calls;
  expect(calls).toHaveLength(1);
  expect(calls[0][0]).toBe('http://mocked-api-path/api/v1/Users');
  expect(calls[0][1].method).toBe('POST');
  expect(calls[0][1].body).toBe(`username=${testUsername}&password=${testPassword}`);
  expect(calls[0][1].headers['Content-Type']).toBe('application/x-www-form-urlencoded; charset=utf-8');
  expect(Object.entries(calls[0][1].headers)).toHaveLength(1);
});
