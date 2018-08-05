import { Config } from '../../app.config';
import { authorisedFetch } from './fetch';
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

  return authorisedFetch(
    url,
    {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      cache: 'no-cache',
      body: body
    }
  );
}

function deleteTag(id) {

  const
    url = `${Config.api}` + tagApi,
    body = querystring.stringify({ tagId: id });

  return authorisedFetch(
    url,
    {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      cache: 'no-cache',
      body: body
    }
  );
}
