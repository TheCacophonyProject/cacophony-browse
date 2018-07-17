import fetch from 'cross-fetch';
import { Config } from '../../app.config' // eslint-disable-line

export default {
  login,
  persistUser,
  logout,
  register
};

function login(username, password) {
  let body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

  return fetch(
    `${Config.api}/authenticate_user`,
    {
      method:"POST",
      body:body,
      headers:{
        'Content-Type':'application/x-www-form-urlencoded; charset=utf-8'
      }
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

  //{"errorType":"validation","message":"username: username in use","errors":{"username":{"location":"body","param":"username","value":"asdfsadf","msg":"username in use"}}}

  let body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
  return fetch(
    `${Config.api}/api/v1/Users`,
    {
      method:"POST",
      body:body,
      headers:{
        'Content-Type':'application/x-www-form-urlencoded; charset=utf-8'
      }
    }
  );
}
