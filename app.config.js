let api;

switch(process.env.NODE_ENV) {
  case 'production':
    api = "http://localhost:1080";
    break;
  case 'development':
    api = "http://localhost:1080";
    break;
  case 'test':
    api = "http://mocked-api-path";
    break;
  default:
    api = "http://localhost:1080";
}

module.exports = {
  'Config': {
    api
  }
};
