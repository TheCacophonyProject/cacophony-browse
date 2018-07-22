let api;

switch(process.env.NODE_ENV) {
case 'production':
  api = "http://172.16.117.140";
  break;
case 'development':
  api = "http://172.16.117.140";
  break;
case 'test':
  api = "http://mocked-api-path";
  break;
default:
  api = "http://172.16.117.140";
}

module.exports = {
  'Config': {
    api
  }
};
