import fetch from 'cross-fetch';
import { Config } from '../../app.config' // eslint-disable-line

export default {
  query, id, comment, del
};

let recordingApi = '/api/v1/recordings';

function query(token, limit, offset, tagMode, tags, query, order) {
  let url = getRecordingURL(query, limit, offset, tagMode, order);
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

function getRecordingURL(query, limit, offset, tagMode, order) {
  // Create query string to add to api url
  let params = {
    where: JSON.stringify(query),
    limit: limit,
    offset: offset,
    tagMode: tagMode
  };
  if (order) {
    params.order = order;
  }
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
