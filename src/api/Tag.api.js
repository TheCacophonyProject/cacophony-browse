import Config from '../../app.config';
import { fetch } from './fetch';
import querystring from 'querystring';

export default {
  addTag, deleteTag
};

const tagApi = '/api/v1/tags';

function addTag(tag, id) {
  const url = `${Config.api}` + tagApi;

  const body = querystring.stringify({
    recordingId: id,
    tag: JSON.stringify(tag)
  });

  return fetch(
    url,
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

  const
    url = `${Config.api}` + tagApi,
    body = querystring.stringify({ tagId: id });

  return fetch(
    url,
    {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    }
  );
}
