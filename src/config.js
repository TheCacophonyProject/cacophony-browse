// These are the values for unit tests. They are overriden at startup
// for dev/staging/prod.
const config = {
  environment: "TEST",
  'api': "http://mocked-api-path"
};

config.tagVersion = 100;
export default config;
