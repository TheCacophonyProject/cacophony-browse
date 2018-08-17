switch (process.env.NODE_ENV) {
  case 'development':
    module.exports = require('./configs/app.config.dev.js');
    break;
  case 'test':
    module.exports = require('./configs/app.config.tests.js');
    break;
  default:
    module.exports = require('./configs/app.config.prod.js');
}
