import { fetch } from './fetch';
import querystring from 'querystring';

export default {
  query, id, comment, del
};

const recordingApi = '/api/v1/recordings';

function query(params) {
  // Params must include where (stringified JSON), limit, offset
  // Params can also include tagMode, tags, order
  const url = ENV.api + recordingApi + "?" + querystring.stringify(params);

  return fetch(
    url,
    {
      method:"GET"
    }
  );
}

function id(id) {
  const url = `${ENV.api}${recordingApi}/${id}`;
  return fetch(
    url,
    {
      method:"GET"
    }
  );
}

function comment(comment, id) {
  const commentString = JSON.stringify({comment: comment});
  const body = `updates=${encodeURIComponent(commentString)}`;
  const url = `${ENV.api}${recordingApi}/${id}`;
  return fetch(
    url,
    {
      method:"PATCH",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    }
  );
}

function del(id) {
  const url = `${ENV.api}${recordingApi}/${id}`;
  return fetch(
    url,
    {
      method:"DELETE"
    }
  );
}
