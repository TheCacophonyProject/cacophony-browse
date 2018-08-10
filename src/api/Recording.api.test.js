jest.mock("./fetch");
import { authorisedFetch } from "./fetch";
import recordingApi from './Recording.api';
import querystring from 'querystring';

describe('query() calls authorisedFetch', () => {

  test('with the correct request params', async () => {
    await recordingApi.query({});
    expect(authorisedFetch.mock.calls[0]).toHaveLength(2);
    expect(authorisedFetch.mock.calls[0][1].method).toBe('GET');
    expect(authorisedFetch.mock.calls[0][1].cache).toBe("no-cache");
  });

  test('with the correct path', async () => {
    await recordingApi.query({});
    expect(authorisedFetch.mock.calls[0][0]).toBe('http://mocked-api-path/api/v1/recordings?');
  });

  test('just once', async () => {
    await recordingApi.query({});
    expect(authorisedFetch).toHaveBeenCalledTimes(1);
  });

  test('with correctly formatted query string', async () =>{
    const params = {
      testQueryObjectValue: JSON.stringify({aKey:"aValue"}),
      testQueryNumberValue: 100,
      testQueryStringValue: "someString"
    };

    await recordingApi.query(params);

    const query = authorisedFetch.mock.calls[0][0].split('?')[1];

    const parsedString = querystring.parse(query);
    expect(Object.keys(parsedString)).toHaveLength(3);
    expect(parsedString.testQueryNumberValue).toBe(params.testQueryNumberValue.toString());
    expect(parsedString.testQueryStringValue).toBe(params.testQueryStringValue.toString());
    expect(parsedString.testQueryObjectValue).toBe(params.testQueryObjectValue);
  });

});

describe('id() calls authorisedFetch', () => {
  test('with the correct request params', async () => {
    await recordingApi.id();
    expect(authorisedFetch.mock.calls[0]).toHaveLength(2);
    expect(authorisedFetch.mock.calls[0][1]).toMatchObject(
      {
        method: 'GET',
        cache: 'no-cache'
      }
    );
  });

  test('with the correct path', async () => {
    const testId = 12345;
    await recordingApi.id(testId);
    expect(authorisedFetch.mock.calls[0][0]).toBe(`http://mocked-api-path/api/v1/recordings/${testId}`);
  });

  test('just once', async () => {
    await recordingApi.id();
    expect(authorisedFetch).toHaveBeenCalledTimes(1);
  });
});

describe('comment() calls authorisedFetch', () => {
  test('with the correct path', async () => {
    const testId = 123456;
    await recordingApi.comment(null, testId);
    expect(authorisedFetch.mock.calls[0][0]).toBe(`http://mocked-api-path/api/v1/recordings/${testId}`);

  });

  test('with the correct request params', async () => {
    const testComment = "some comment";

    await recordingApi.comment(testComment, null);
    expect(authorisedFetch.mock.calls[0]).toHaveLength(2);
    expect(authorisedFetch.mock.calls[0][1]).toMatchObject(
      {
        method: 'PATCH',
        cache: 'no-cache',
        body: `updates=${encodeURIComponent(JSON.stringify({comment: testComment}))}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
  });

  test('just once', async () => {
    await recordingApi.comment();
    expect(authorisedFetch).toHaveBeenCalledTimes(1);
  });
});

describe('del() calls authorisedFetch', () => {

    test('with the correct path', async () => {
      const testId = 123456;
      await recordingApi.del(testId);
      expect(authorisedFetch.mock.calls[0][0]).toBe(`http://mocked-api-path/api/v1/recordings/${testId}`);

    });

    test('with the correct request params', async () => {

      await recordingApi.del(null);
      expect(authorisedFetch.mock.calls[0]).toHaveLength(2);
      expect(authorisedFetch.mock.calls[0][1]).toMatchObject(
        {
          method: 'DELETE',
          cache: 'no-cache'
        }
      );
    });

    test('just once', async () => {
      await recordingApi.del();
      expect(authorisedFetch).toHaveBeenCalledTimes(1);
    });
});
