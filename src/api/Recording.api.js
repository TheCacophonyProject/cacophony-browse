import config from '../config';
import { fetch } from './fetch';
import querystring from 'querystring';

export default {
  query, id, comment, del, tracks, addTrackTag, deleteTrackTag
};

const apiPath = '/api/v1/recordings';

function query(params) {
  // Params must include where (stringified JSON), limit, offset
  // Params can also include tagMode, tags, order
  const url = config.api + apiPath + "?" + querystring.stringify(params);

  return fetch(
    url,
    {
      method:"GET"
    }
  );
}

function id(id) {
  const url = `${config.api}${apiPath}/${id}`;
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
  const url = `${config.api}${apiPath}/${id}`;
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
  const url = `${config.api}${apiPath}/${id}`;
  return fetch(
    url,
    {
      method:"DELETE"
    }
  );
}

function tracks(recordingId) {
  const url = `${config.api}${apiPath}/${recordingId}/tracks`;
  return fetch(
    url,
    {
      method:"GET"
    }
  );
}

function addTrackTag(tag, recordingId, trackId) {
  const body = querystring.stringify({
    what: tag.what,
    confidence: tag.confidence,
    automatic: "false",
    data: JSON.stringify("")
  });

  const url = `${config.api}${apiPath}/${recordingId}/tracks/${trackId}/tags`;

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

function deleteTrackTag(tag, recordingId) {
  const url = `${config.api}${apiPath}/${recordingId}/tracks/${tag.TrackId}/tags/${tag.id}`;
  return fetch(
    url,
    {
      method:"DELETE"
    }
  );
}
