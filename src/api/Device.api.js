import fetch from 'cross-fetch'
import { Config } from '../../app.config' // eslint-disable-line

export default {
	allDevices
}

function allDevices(token) {
	return fetch(
		`${Config.api}/api/v1/devices`,
		{
			method:"GET",
			headers: {'Authorization': token},
			mode: 'cors',
			cache: "no-cache",
		}
	)
}
