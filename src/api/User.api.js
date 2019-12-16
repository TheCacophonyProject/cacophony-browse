import CacophonyApi from "./CacophonyApi";

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
  return CacophonyApi.post("/authenticate_user", {
    nameOrEmail: usernameOrEmail,
    password: password
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
  return CacophonyApi.post("/api/v1/Users", {
    username: username,
    password: password,
    endUserAgreement: endUserAgreement,
    email: email
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
