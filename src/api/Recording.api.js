import fetch from 'cross-fetch'
import { Config } from '../../app.config' // eslint-disable-line

export default {
	recording
}

function recording(token, limit, offset, tagMode, tags, query) {
	let url = getRecordingURL(query, limit, offset, tagMode)
	return fetch(
		url,
		{
			method:"GET",
			headers: {'Authorization': token},
			mode: 'cors',
			cache: "no-cache"
		}
	)
}

function getRecordingURL(query, limit, offset, tagMode) {
  // Create query string to add to api url
  let params = {
    where: JSON.stringify(query),
    limit: limit,
    offset: offset,
    tagMode: tagMode
  };
  let queryString = Object.keys(params).map((key) => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
  let url = `${Config.api}/api/v1/recordings` + "?" + queryString;
  return url;
}
