// These are the values for unit tests. They are overriden at startup
// for dev/staging/prod.
const Config = {
  environment: "TEST",
  api: "http://mocked-api-path",
  linzBasemapApiKey: "YOUR_API_KEY_HERE",
  tagVersion: 100,
};

// eslint-disable-next-line no-undef
module.exports = Config;
