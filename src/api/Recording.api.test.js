jest.mock("./fetch");
import { fetch } from "./fetch";
import recordingApi from './Recording.api';
import querystring from 'querystring';

describe('query() calls fetch', () => {

  test('with the correct request params', async () => {
    await recordingApi.query({});
    expect(fetch.mock.calls[0]).toHaveLength(2);
    expect(fetch.mock.calls[0][1].method).toBe('GET');
  });

  test('with the correct path', async () => {
    await recordingApi.query({});
    expect(fetch.mock.calls[0][0]).toBe('http://mocked-api-path/api/v1/recordings?');
  });

  test('just once', async () => {
    await recordingApi.query({});
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('with correctly formatted query string', async () =>{
    const params = {
      testQueryObjectValue: JSON.stringify({aKey:"aValue"}),
      testQueryNumberValue: 100,
      testQueryStringValue: "someString"
    };

    await recordingApi.query(params);

    const query = fetch.mock.calls[0][0].split('?')[1];

    const parsedString = querystring.parse(query);
    expect(Object.keys(parsedString)).toHaveLength(3);
    expect(parsedString.testQueryNumberValue).toBe(params.testQueryNumberValue.toString());
    expect(parsedString.testQueryStringValue).toBe(params.testQueryStringValue.toString());
    expect(parsedString.testQueryObjectValue).toBe(params.testQueryObjectValue);
  });

});

describe('id() calls fetch', () => {
  test('with the correct request params', async () => {
    await recordingApi.id();
    expect(fetch.mock.calls[0]).toHaveLength(2);
    expect(fetch.mock.calls[0][1]).toMatchObject(
      {
        method: 'GET'
      }
    );
  });

  test('with the correct path', async () => {
    const testId = 12345;
    await recordingApi.id(testId);
    expect(fetch.mock.calls[0][0]).toBe(`http://mocked-api-path/api/v1/recordings/${testId}`);
  });

  test('just once', async () => {
    await recordingApi.id();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('comment() calls fetch', () => {
  test('with the correct path', async () => {
    const testId = 123456;
    await recordingApi.comment(null, testId);
    expect(fetch.mock.calls[0][0]).toBe(`http://mocked-api-path/api/v1/recordings/${testId}`);

  });

  test('with the correct request params', async () => {
    const testComment = "some comment";

    await recordingApi.comment(testComment, null);
    expect(fetch.mock.calls[0]).toHaveLength(2);
    expect(fetch.mock.calls[0][1]).toMatchObject(
      {
        method: 'PATCH',
        body: `updates=${encodeURIComponent(JSON.stringify({comment: testComment}))}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
  });

  test('just once', async () => {
    await recordingApi.comment();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('del() calls fetch', () => {

    test('with the correct path', async () => {
      const testId = 123456;
      await recordingApi.del(testId);
      expect(fetch.mock.calls[0][0]).toBe(`http://mocked-api-path/api/v1/recordings/${testId}`);

    });

    test('with the correct request params', async () => {

      await recordingApi.del(null);
      expect(fetch.mock.calls[0]).toHaveLength(2);
      expect(fetch.mock.calls[0][1]).toMatchObject(
        {
          method: 'DELETE'
        }
      );
    });

    test('just once', async () => {
      await recordingApi.del();
      expect(fetch).toHaveBeenCalledTimes(1);
    });
});
