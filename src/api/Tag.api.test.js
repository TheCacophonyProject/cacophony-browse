jest.mock("./fetch");
import { authorisedFetch } from './fetch';
import tagApi from './Tag.api';
import querystring from 'querystring';

describe('addTag() calls authorisedFetch', () => {
  test('with the correct path', async () => {
    await tagApi.addTag();
    expect(authorisedFetch.mock.calls[0][0]).toBe(`http://mocked-api-path/api/v1/tags`);
  });

  test('with the correct request params', async () => {
    const
      testRecordingId = 123456,
      testTag = { someKey: 'some value' };

    await tagApi.addTag(testTag, testRecordingId);
    expect(authorisedFetch.mock.calls[0]).toHaveLength(2);
    expect(authorisedFetch.mock.calls[0][1]).toMatchObject(
      {
        method: 'POST',
        cache: 'no-cache',
        body: querystring.stringify({recordingId: testRecordingId, tag: JSON.stringify(testTag)}),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
  });

  test('just once', async () => {
    await tagApi.addTag();
    expect(authorisedFetch).toHaveBeenCalledTimes(1);
  });
});

describe('deleteTag() calls authorisedFetch', () => {
  test('with the correct path', async () => {
    await tagApi.deleteTag();
    expect(authorisedFetch.mock.calls[0][0]).toBe(`http://mocked-api-path/api/v1/tags`);
  });

  test('with the correct request params', async () => {
    const testTagId = 123456;

    await tagApi.deleteTag(testTagId);
    expect(authorisedFetch.mock.calls[0]).toHaveLength(2);
    expect(authorisedFetch.mock.calls[0][1]).toMatchObject(
      {
        method: 'DELETE',
        cache: 'no-cache',
        body: querystring.stringify({tagId: JSON.stringify(testTagId)}),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
  });

  test('just once', async () => {
    await tagApi.deleteTag();
    expect(authorisedFetch).toHaveBeenCalledTimes(1);
  });
});
