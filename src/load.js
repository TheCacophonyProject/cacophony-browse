import config from "./config";
config.environment = __ENV__; //eslint-disable-line
config.api = __API__; //eslint-disable-line
config.linzBasemapApiKey = __LINZ_API_KEY__; //eslint-disable-line

import main from "./main";
main();
