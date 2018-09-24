import config from '../config';
import { fetch } from './fetch';
import querystring from 'querystring';

export default {
  addTag, deleteTag
};

const apiPath = '/api/v1/tags';

function addTag(tag, id) {
  const body = querystring.stringify({
    recordingId: id,
    tag: JSON.stringify(tag)
  });

  return fetch(
    config.api + apiPath,
    {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    }
  );
}

function deleteTag(id) {
  return fetch(
    config.api + apiPath,
    {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: querystring.stringify({ tagId: id })
    }
  );
}
