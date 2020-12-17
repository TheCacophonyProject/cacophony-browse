import CacophonyApi from "./CacophonyApi";

function login(usernameOrEmail, password) {
  return CacophonyApi.post("/authenticate_user", {
    nameOrEmail: usernameOrEmail,
    password: password,
  });
}

function loginOther(username) {
  return CacophonyApi.post("/admin_authenticate_as_other_user", {
    name: username,
  });
}

function list() {
  return CacophonyApi.get("/api/v1/listUsers");
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
  localStorage.removeItem("username");
  localStorage.removeItem("userId");
  localStorage.removeItem("JWT");
  localStorage.removeItem("email");
  localStorage.removeItem("globalPermission");
  localStorage.removeItem("acceptedEUA");
  localStorage.removeItem("superUserCreds");
}
function register(username, password, email, endUserAgreement) {
  return CacophonyApi.post("/api/v1/Users", {
    username: username,
    password: password,
    endUserAgreement: endUserAgreement,
    email: email,
  });
}
function updateFields(fields) {
  return CacophonyApi.patch("/api/v1/Users", fields);
}
function getEUAVersion() {
  return CacophonyApi.get("/api/v1/endUserAgreement/latest");
}

async function token() {
  // Params must include where (stringified JSON), limit, offset
  // Params can also include tagMode, tags, order
  const { result, success } = await CacophonyApi.post("/token");
  if (!success) {
    throw "Failed to get token";
  }
  return result.token;
}

export default {
  login,
  loginOther,
  persistUser,
  list,
  logout,
  register,
  updateFields,
  persistFields,
  getEUAVersion,
  token,
};
