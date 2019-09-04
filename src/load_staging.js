import config from "./config";
config.environment = __ENV_STAGING__;  //eslint-disable-line
config.api = __API_STAGING__;          //eslint-disable-line

import main from "./main";
main();
