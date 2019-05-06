jest.mock('../stores');

import crossFetch from 'cross-fetch'; // mocked in __mocks__fetch.js
import router from '../router';
import store from '../stores';
import { fetch } from './fetch';

test('fetch(url, paramsObject) calls crossFetch with correct params', async () => {
  const
    testURL = 'testURL',
    testObject = {
      'some': 'thing',
      'mode': 'default override'
    },
    testToken = 'some token value';

  crossFetch
    .mockReturnValue({
      status: 200,
      json: () => {
        return Promise.resolve({});
      }
    });

  store.getters['User/getToken'] = testToken;

  await fetch(testURL, testObject);

  expect(crossFetch).toHaveBeenCalledTimes(1);
  expect(crossFetch).toHaveBeenCalledWith(
    'testURL',
    {
      headers: {Authorization: testToken},
      some: 'thing',
      mode: 'default override',
      cache: 'no-cache'
    }
  );
});

test('fetch(url, paramsObject) handles response with general errors', async () => {

  const testResultObject = {
    errors: {
      someErrorKey: {
        param: 'someErrorParam', // TODO: Find the purpose of the param? Is it a key for local content lookup?
        msg: 'some error message'
      },
      someOtherErrorKey: {
        param: 'someOtherErrorKey', // TODO: Find the purpose of the param? Is it a key for local content lookup?
        msg: 'some other error message'
      }
    }
  };

  crossFetch.mockReturnValue({
    status: 400,
    json: () => Promise.resolve(testResultObject)
  });

  const result = await fetch('', {});

  expect(store.dispatch).toHaveBeenCalledTimes(2);
  expect(store.dispatch).toHaveBeenCalledWith('Messaging/ERROR', testResultObject.errors.someErrorKey.msg);
  expect(store.dispatch).toHaveBeenCalledWith('Messaging/ERROR', testResultObject.errors.someOtherErrorKey.msg);

  expect(router.push).not.toHaveBeenCalled();
  expect(result).toMatchObject(testResultObject);

});

test('fetch(url, paramsObject) handles response with authentication error', async () => {

  const testResultObject = {
    messages: [
      "Failed to log in.  Please try to log out and log in again."
    ]
  };

  crossFetch.mockReturnValue({
    status: 401,
    json: () => Promise.resolve(testResultObject)
  });

  const result = await fetch('', {});

  expect(store.dispatch).toHaveBeenCalledTimes(2);
  expect(store.dispatch).toHaveBeenCalledWith('User/LOGOUT');
  expect(store.dispatch).toHaveBeenCalledWith(
    'Messaging/ERROR',
    'Error accessing your account.   Please log in again.'
  );

  expect(router.push).toHaveBeenCalledTimes(1);
  expect(router.push).toHaveBeenCalledWith('login');
});

test('fetch(url, paramsObject) handles response with "success" result', async () => {

  const testResultObject = {messages: ['some message']};

  crossFetch.mockReturnValue({
    status: 200,
    json: () => {
      return Promise.resolve(testResultObject);
    }
  });

  const result = await fetch('', {});

  expect(store.dispatch).toHaveBeenCalledTimes(1);
  expect(store.dispatch).toHaveBeenCalledWith('Messaging/SUCCESS', testResultObject.messages[0]);
  expect(result).toMatchObject(testResultObject);
});
