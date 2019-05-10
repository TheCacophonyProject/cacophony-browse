import crossFetch from 'cross-fetch';
import store from '../stores/index';
import router from '../router';

const defaults = {
  mode: 'cors',
  cache: 'no-cache',
  headers: {}
};

/**
 * Returns a promise that when resolved, returns an object with a result, success boolean, and status code.
 * The result field is the JSON blob from the response body.
 * These fields can easily be resolved using object destructuring to directly assign the required information.
 * @returns {Promise<{result: any, success: boolean, status: number}>}
 */
export async function fetch() {

  const args = [].slice.call(arguments, 0);
  const requiresAuth = args.requiresAuth || true;

  args[1] = {
    ...defaults,
    ...args[1],
    headers: {
      ...args[1].headers,
      Authorization: store.getters['User/getToken']
    }
  };

  const response = await crossFetch.apply(this, args);
  const status = response.status;

  if(requiresAuth && status === 401) {
    store.dispatch('User/LOGOUT');
    store.dispatch('Messaging/ERROR', 'Error accessing your account.   Please log in again.');
    router.push('login');
    return;
  }

  const result = await response.json();
  handleMessages(result, status);
  return {result, status, success: response.ok};
}

function handleMessages(result, status) {
  let level;
  if (status < 200) {
    level = "INFO";
  } else if (status < 300) {
    level = "SUCCESS";
  } else if (status >= 400) {
    level = "ERROR";
  }

  if(result.errors) {
    for (const key in result.errors) {
      store.dispatch('Messaging/ERROR', result.errors[key].msg);
    }
  }
  result.messages && result.messages.forEach(message => store.dispatch(`Messaging/${level}`, message));
  if (result.errorType == "client") {
    store.dispatch('Messaging/ERROR', result.message);
  }
}
