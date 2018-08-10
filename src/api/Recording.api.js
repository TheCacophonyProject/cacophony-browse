import { Config } from '../../app.config';
import { authorisedFetch } from './fetch';
import querystring from 'querystring';

export default {
  query, id, comment, del
};

const recordingApi = '/api/v1/recordings';

function query(params) {
  // Params must include where (stringified JSON), limit, offset
  // Params can also include tagMode, tags, order
  const url = Config.api + recordingApi + "?" + querystring.stringify(params);

  return authorisedFetch(
    url,
    {
      method:"GET",
      cache: "no-cache"
    }
  );
}

function id(id) {
  const url = `${Config.api}${recordingApi}/${id}`;
  return authorisedFetch(
    url,
    {
      method:"GET",
      cache: "no-cache"
    }
  );
}

function comment(comment, id) {
  const commentString = JSON.stringify({comment: comment});
  const body = `updates=${encodeURIComponent(commentString)}`;
  const url = `${Config.api}${recordingApi}/${id}`;
  return authorisedFetch(
    url,
    {
      method:"PATCH",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      cache: "no-cache",
      body: body
    }
  );
}

function del(id) {
  const url = `${Config.api}${recordingApi}/${id}`;
  return authorisedFetch(
    url,
    {
      method:"DELETE",
      cache: "no-cache"
    }
  );
}
