import crossFetch from 'cross-fetch';
import store from '../stores/index';
import router from '../router';

export async function authorisedFetch() {

  const args = [].slice.call(arguments, 0);

  const headers = args[1].headers || {};

  args[1].headers = {
    ...headers,
    Authorization: store.getters['User/getToken'] };

  args[1].mode = args[1].mode || 'cors';

  const response = await crossFetch.apply(this, args);
  const result = await response.json();

  if(!response.ok) {
    if(result.errors) {
      for (const key in result.errors) {
        store.dispatch('Messaging/ERROR', result.errors[key].msg);

        if(key === "authorization") {
          store.dispatch('User/LOGOUT');
          router.push('login');
        }
      }
    }
  }
  return result;
}

export async function fetch() {

  const args = [].slice.call(arguments, 0);

  const headers = args[1].headers || {};

  args[1].headers = {
    ...headers
  };

  args[1].mode = args[1].mode || 'cors';

  const response = await crossFetch.apply(this, args);
  const result = await response.json();

  if(!response.ok) {
    for (const i in result.errors) {
      store.dispatch('Messaging/ERROR', result.errors[i].msg);
    }
  }
  return result;
}
