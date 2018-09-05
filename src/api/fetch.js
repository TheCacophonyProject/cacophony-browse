import crossFetch from 'cross-fetch';
import store from '../stores/index';
import router from '../router';

const defaults = {
  mode: 'cors',
  cache: 'no-cache',
  headers: {}
};

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

  if(requiresAuth && response.status === 401) { // TODO: The API returns a 422 for an invalid JWT, is that an API bug or do we handle the fairly broad 422 as well? https://tree.taiga.io/project/the-cacophony-project/us/361
    store.dispatch('User/LOGOUT');
    router.push('login');
  }

  const result = await response.json();
  handleMessages(result, response.status);
  return result;
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
