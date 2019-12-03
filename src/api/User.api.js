import config from "../config";
import { fetch } from "./fetch";

export default {
  login,
  persistUser,
  logout,
  register,
  updateFields,
  persistFields,
  token
};

function login(usernameOrEmail, password) {
  return fetch(`${config.api}/authenticate_user`, {
    method: "POST",
    body: JSON.stringify({
      nameOrEmail: usernameOrEmail,
      password: password
    }),
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function persistUser(username, token, email, globalPermission, userId) {
  localStorage.setItem("username", username);
  localStorage.setItem("JWT", token);
  localStorage.setItem("email", email);
  localStorage.setItem("globalPermission", globalPermission);
  localStorage.setItem("userId", userId);
}

function persistFields(data) {
  for (var key in data) {
    localStorage.setItem(key, data[key]);
  }
}
function logout() {
  localStorage.setItem("username", "");
  localStorage.setItem("userId", "");
  localStorage.setItem("JWT", "");
  localStorage.setItem("email", "");
  localStorage.setItem("globalPermission", "");
}
function register(username, password, email) {
  return fetch(`${config.api}/api/v1/Users`, {
    method: "POST",
    body: JSON.stringify({
      username: username,
      password: password,
      email: email
    }),
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
function updateFields(fields) {
  return fetch(`${config.api}/api/v1/Users`, {
    method: "PATCH",
    body: JSON.stringify(fields),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

async function token() {
  // Params must include where (stringified JSON), limit, offset
  // Params can also include tagMode, tags, order
  const url = `${config.api}/token`;
  const { result, success } = await fetch(url, { method: "POST" });
  if (!success) {
    throw "Failed to get token";
  }
  return result.token;
}
