jest.mock('../stores');

import crossFetch from 'cross-fetch'; // mocked in __mocks__fetch.js
import router from '../router';
import store from '../stores';
import { authorisedFetch, fetch } from './fetch';

test('authorisedFetch(url, paramsObject) calls crossFetch with correct params', async () => {
  const
    testURL = 'testURL',
    testObject = {'some': 'thing'},
    testToken = 'some token value';

  crossFetch
    .mockReturnValue({
      ok: true,
      json: () => {
        return Promise.resolve({ok: true});
      }
    });

  store.getters['User/getToken'] = testToken;

  await authorisedFetch(testURL, testObject);

  expect(crossFetch).toHaveBeenCalledTimes(1);
  expect(crossFetch).toHaveBeenCalledWith(
    'testURL',
    {
      headers: {Authorization: testToken},
      some: 'thing',
      mode: 'cors'
    }
  );
});

test('authorisedFetch(url, paramsObject) handles response with general errors', async () => {

  const testResultObject = {
    errors: {
      someErrorKey: {
        param: 'someErrorParam', // TODO: Find the purpose of the param? Is is a key for local content lookup?
        msg: 'some error message'
      },
      someOtherErrorKey: {
        param: 'someOtherErrorKey', // TODO: Find the purpose of the param? Is is a key for local content lookup?
        msg: 'some other error message'
      }
    }
  };

  const failedResponse = {
    ok: false,
    json: () => Promise.resolve(testResultObject)
  };

  crossFetch.mockReturnValue(failedResponse);

  const result = await authorisedFetch('', {});

  expect(store.dispatch).toHaveBeenCalledTimes(2);
  expect(store.dispatch).toHaveBeenCalledWith('Messaging/ERROR', testResultObject.errors.someErrorKey.msg);
  expect(store.dispatch).toHaveBeenCalledWith('Messaging/ERROR', testResultObject.errors.someOtherErrorKey.msg);

  expect(router.push).not.toHaveBeenCalled();
  expect(result).toMatchObject(testResultObject);

});

test('authorisedFetch(url, paramsObject) handles response with authentication error', async () => {

  const testResultObject = {
    errors: {
      authorization: {
        param: 'authorization', // TODO: Find the purpose of the param? Is is a key for local content lookup?
        msg: 'some error message'
      }
    }
  };

  const failedAuthorisationResponse = {
    ok: false,
    json: () => Promise.resolve(testResultObject)
  };

  crossFetch.mockReturnValue(failedAuthorisationResponse);

  const result = await authorisedFetch('', {});

  expect(store.dispatch).toHaveBeenCalledTimes(2);
  expect(store.dispatch).toHaveBeenCalledWith('User/LOGOUT');
  expect(store.dispatch).toHaveBeenCalledWith('Messaging/ERROR', testResultObject.errors.authorization.msg);

  expect(router.push).toHaveBeenCalledTimes(1);
  expect(router.push).toHaveBeenCalledWith('login');
  expect(result).toMatchObject(testResultObject);
});

test('authorisedFetch(url, paramsObject) handles response with "success" result', async () => {

  const testResultObject = {ok: true};
  crossFetch
    .mockReturnValue({
      ok: true,
      json: () => {
        return Promise.resolve(testResultObject);
      }
    });

  const result = await authorisedFetch('', {});

  expect(store.dispatch).not.toHaveBeenCalled();
  expect(router.push).not.toHaveBeenCalled();
  expect(result).toMatchObject(testResultObject);
});


test('fetch(url, paramsObject) calls crossFetch with correct params', async () => {

});

test('fetch(url, paramsObject) handles response with general errors', async () => {

  const testResultObject = {
    errors: {
      someErrorKey: {
        param: 'someErrorParam', // TODO: Find the purpose of the param? Is is a key for local content lookup?
        msg: 'some error message'
      },
      someOtherErrorKey: {
        param: 'someOtherErrorKey', // TODO: Find the purpose of the param? Is is a key for local content lookup?
        msg: 'some other error message'
      }
    }
  };

  const failedResponse = {
    ok: false,
    json: () => Promise.resolve(testResultObject)
  };

  crossFetch.mockReturnValue(failedResponse);

  const result = await fetch('', {});

  expect(store.dispatch).toHaveBeenCalledTimes(2);
  expect(store.dispatch).toHaveBeenCalledWith('Messaging/ERROR', testResultObject.errors.someErrorKey.msg);
  expect(store.dispatch).toHaveBeenCalledWith('Messaging/ERROR', testResultObject.errors.someOtherErrorKey.msg);

  expect(result).toMatchObject(testResultObject);

});

test('fetch(url, paramsObject) handles response with "success" result', async () => {
  const
    testURL = 'testURL',
    testObject = {some: 'thing'};

  await fetch(testURL, testObject);

  const calls = crossFetch.mock.calls;
  expect(crossFetch).toHaveBeenCalledTimes(1);
  expect(calls[0][0]).toBe('testURL');
  expect(calls[0][1]).toBe(testObject);
});
