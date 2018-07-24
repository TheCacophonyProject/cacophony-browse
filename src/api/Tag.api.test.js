import crossFetch from 'cross-fetch'; // mocked __mocks__/cross-fetch.js
import tagApi from './Tag.api';
import {LocalStorageMock} from '../tests/testUtils';
import { Config } from '../../app.config' // eslint-disable-line

global.localStorage = new LocalStorageMock();

const tagApiUrl = '/api/v1/tags';

describe('addTag(tag,id,token) calls tag api via fetch', () => {
  let testTagSimple = {animal: "possum", confidence: 0.6}
  let testTagLong = {
    age: 15,
    animal: "bird",
    confidence: 0.6,
    duration: 10,
    event: "interaction with lure",
    number: "2",
    startTime: 30,
    trapType: "Good Nature possums"
  }
  let testId = 1234;
  let testToken = 'testJWT';

  test('addTag() with simple tag', async () => {
    let expectedUrl = `${Config.api}${tagApiUrl}`
    let expectedBody = `recordingId=${encodeURIComponent(testId)}&tag=${encodeURIComponent(JSON.stringify(testTagSimple))}`

    await tagApi.addTag(testTagSimple, testId, testToken);

    let calls = crossFetch.default.mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe(expectedUrl);
    expect(calls[0][1].method).toBe('POST');
    expect(Object.entries(calls[0][1].headers)).toHaveLength(2);
    expect(calls[0][1].headers['Authorization']).toBe(testToken);
    expect(calls[0][1].headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(calls[0][1].body).toBe(expectedBody)
  })

  test('addTag() with long tag', async () => {
    let expectedUrl = `${Config.api}${tagApiUrl}`
    let expectedBody = `recordingId=${encodeURIComponent(testId)}&tag=${encodeURIComponent(JSON.stringify(testTagLong))}`

    await tagApi.addTag(testTagLong, testId, testToken);

    let calls = crossFetch.default.mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe(expectedUrl);
    expect(calls[0][1].method).toBe('POST');
    expect(Object.entries(calls[0][1].headers)).toHaveLength(2);
    expect(calls[0][1].headers['Authorization']).toBe(testToken);
    expect(calls[0][1].headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(calls[0][1].body).toBe(expectedBody)
  })
})

describe('deleteTag(id,token) calls tag api via fetch', () => {
  let testId = 1234;
  let testToken = 'testJWT';

  test('deleteTag()', async () => {
    let expectedUrl = `${Config.api}${tagApiUrl}`
    let expectedBody = `tagId=${encodeURIComponent(testId)}`

    await tagApi.deleteTag(testId, testToken);

    let calls = crossFetch.default.mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe(expectedUrl);
    expect(calls[0][1].method).toBe('DELETE');
    expect(Object.entries(calls[0][1].headers)).toHaveLength(2);
    expect(calls[0][1].headers['Authorization']).toBe(testToken);
    expect(calls[0][1].headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(calls[0][1].body).toBe(expectedBody)
  })
})
