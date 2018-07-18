import fetch from 'cross-fetch';
import { Config } from '../../app.config' // eslint-disable-line

export default {
  addTag
};

let tagApi = '/api/v1/tags';

function addTag(tag, id, token) {
  let url = `${Config.api}` + tagApi;
  tag = JSON.stringify(tag);
  let body = `recordingId=${encodeURIComponent(id)}&tag=${encodeURIComponent(tag)}`;
  return fetch(
    url,
    {
      method: "POST",
      headers: {
        'Authorization': token,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      mode: 'cors',
      cache: 'no-cache',
      body: body
    }
  );
}
