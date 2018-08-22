import { fetch } from './fetch';

export default {
  login,
  augmentUserData,
  persistUser,
  logout,
  register
};

function login(username, password) {
  const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
  return fetch(
    `${ENV.api}/authenticate_user`,
    {
      method:"POST",
      body:body,
      headers:{
        'Content-Type':'application/x-www-form-urlencoded; charset=utf-8'
      }
    }
  );
}
function augmentUserData(username) {
  return fetch(
    `${ENV.api}/users/${username}`,
    {
      method:"GET"
    }
  );
}
function persistUser(username, token) {
  localStorage.setItem('username', username);
  localStorage.setItem('JWT', token);
}
function logout(){
  localStorage.setItem('username', '');
  localStorage.setItem('JWT', '');
}
function register(username, password) {
  const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
  return fetch(
    `${ENV.api}/api/v1/Users`,
    {
      method:"POST",
      body:body,
      headers:{
        'Content-Type':'application/x-www-form-urlencoded; charset=utf-8'
      }
    }
  );
}
