let api;

switch(process.env.NODE_ENV) {
  case 'production':
    api = "https://api-test.cacophony.org.nz";
    break;
  case 'development':
    api = "https://api-test.cacophony.org.nz";
    break;
  case 'test':
    api = "http://mocked-api-path";
    break;
  default:
    api = "https://api-test.cacophony.org.nz";
}

module.exports = {
  'Config': {
    api
  }
};
