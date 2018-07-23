import fetch from 'cross-fetch';
import { Config } from '../../app.config' // eslint-disable-line

export default {
  query, id, comment, del
};

const recordingApi = '/api/v1/recordings';

function query(token, params) {
  // Params must include where (stringified JSON), limit, offset
  // Params can also include tagMode, tags, order
  let url = getRecordingURL(params);
  return fetch(
    url,
    {
      method:"GET",
      headers: {'Authorization': token},
      mode: 'cors',
      cache: "no-cache"
    }
  );
}

function getRecordingURL(params) {
  // Create query string to add to api url
  let queryString = Object.keys(params).map((key) => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
  let url = `${Config.api}` + recordingApi + "?" + queryString;
  return url;
}


function id(id, token) {
  let url = `${Config.api}` + recordingApi + `/${id}`;
  return fetch(
    url,
    {
      method:"GET",
      headers: {'Authorization': token},
      mode: 'cors',
      cache: "no-cache"
    }
  );
}

function comment(comment, id, token) {
  let commentString = JSON.stringify({comment: comment});
  let body = `updates=${encodeURIComponent(commentString)}`;
  let url = `${Config.api}${recordingApi}/${id}`;
  return fetch(
    url,
    {
      method:"PATCH",
      headers: {'Authorization': token, 'Content-Type': 'application/x-www-form-urlencoded'},
      mode: 'cors',
      cache: "no-cache",
      body: body
    }
  );
}

function del(id, token) {
  let url = `${Config.api}${recordingApi}/${id}`;
  return fetch(
    url,
    {
      method:"DELETE",
      headers: {'Authorization': token},
      mode: 'cors',
      cache: "no-cache"
    }
  );
}
