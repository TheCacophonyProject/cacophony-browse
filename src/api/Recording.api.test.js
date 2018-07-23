import crossFetch from 'cross-fetch'; // mocked __mocks__/cross-fetch.js
import recordingApi from './Recording.api';
import {LocalStorageMock} from '../tests/testUtils';
import { Config } from '../../app.config' // eslint-disable-line

global.localStorage = new LocalStorageMock();

const recordingApiUrl = '/api/v1/recordings';

describe('query calls recordings api via fetch', () => {
  const testToken = 'testJWT';
  const testLimit = 100;
  const testOffset = 0;
  const testTagMode = 'any';
  const testTags = '';
  const testWhere = JSON.stringify({type: 'thermalRaw'})
  const testOrder = null

  test('query call with where, limit, offset params', async () =>{
    let params = {
      where: testWhere,
      limit: testLimit,
      offset: testOffset
    }
    let queryString = Object.keys(params).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
    let url = `${Config.api}` + recordingApiUrl + "?" + queryString;

    await recordingApi.query(testToken, params)

    const calls = crossFetch.default.mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe(url);
    expect(calls[0][1].method).toBe('GET');
    expect(calls[0][1].headers['Authorization']).toBe(testToken);
    expect(Object.entries(calls[0][1].headers)).toHaveLength(1);
  })

  test('query call with all params', async () =>{
    let params = {
      where: testWhere,
      limit: testLimit,
      offset: testOffset,
      tagMode: testTagMode,
      order: testOrder,
      tags: testTags
    }
    let queryString = Object.keys(params).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
    let url = `${Config.api}` + recordingApiUrl + "?" + queryString;

    await recordingApi.query(testToken, params)

    const calls = crossFetch.default.mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe(url);
    expect(calls[0][1].method).toBe('GET');
    expect(calls[0][1].headers['Authorization']).toBe(testToken);
    expect(Object.entries(calls[0][1].headers)).toHaveLength(1);
  })

});
