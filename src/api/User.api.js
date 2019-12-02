import config from "../config";
import { fetch } from "./fetch";

export default {
  login,
  persistUser,
  logout,
  register,
  updateFields,
  persistFields,
  getEUAVersion,
  token
};

function login(usernameOrEmail, password) {
  const body = `nameOrEmail=${encodeURIComponent(
    usernameOrEmail
  )}&password=${encodeURIComponent(password)}`;
  return fetch(`${config.api}/authenticate_user`, {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    }
  });
}

function persistUser(
  username,
  token,
  email,
  globalPermission,
  userId,
  acceptedEUA
) {
  localStorage.setItem("username", username);
  localStorage.setItem("JWT", token);
  localStorage.setItem("email", email);
  localStorage.setItem("globalPermission", globalPermission);
  localStorage.setItem("userId", userId);
  localStorage.setItem("acceptedEUA", acceptedEUA);
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
  localStorage.setItem("acceptedEUA", "");
}
function register(username, password, email, endUserAgreement) {
  const body =
    `username=${encodeURIComponent(username)}` +
    `&password=${encodeURIComponent(password)}` +
    `&endUserAgreement=${encodeURIComponent(endUserAgreement)}` +
    `&email=${encodeURIComponent(email)}`;
  return fetch(`${config.api}/api/v1/Users`, {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    }
  });
}
function updateFields(fields) {
  return fetch(`${config.api}/api/v1/Users`, {
    method: "PATCH",
    body: `data=${encodeURIComponent(JSON.stringify(fields))}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
}
function getEUAVersion() {
  return fetch(`${config.api}/api/v1/endUserAgreementVersion`, {
    method: "GET"
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
