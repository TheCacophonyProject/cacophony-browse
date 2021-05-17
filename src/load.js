import config from "./config";
config.environment = __ENV__; //eslint-disable-line
config.api = __API__; //eslint-disable-line
config.linzBasemapApiKey = __LINZ_API_KEY__; //eslint-disable-line
config.revisionInfo = {
  version: __VERSION__,
  commit: `${__COMMIT_HASH__.slice(0, 10)}`,
  branch: __BRANCH__,
  time: __LAST_COMMIT_DATETIME__,
};

import main from "./main";
main();
