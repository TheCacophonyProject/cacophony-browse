import config from "./config";
config.environment = __ENV_STAGING__; //eslint-disable-line
config.api = __API_STAGING__; //eslint-disable-line
config.linzBasemapApiKey = __LINZ_API_KEY__; //eslint-disable-line
config.revisionInfo = {
  // eslint-disable-next-line no-undef
  version: __VERSION__,
  // eslint-disable-next-line no-undef
  commit: __COMMIT_HASH__,
  // eslint-disable-next-line no-undef
  branch: __BRANCH__,
  // eslint-disable-next-line no-undef
  time: __LAST_COMMIT_DATETIME__,
};

// eslint-disable-next-line no-undef
if (__TRAVIS_TAG__) {
  config.revisionInfo.travis = {
    // eslint-disable-next-line no-undef
    tag: __TRAVIS_TAG__,
    // eslint-disable-next-line no-undef
    buildWebUrl: __TRAVIS_BUILD_WEB_URL__,
    // eslint-disable-next-line no-undef
    commit: __TRAVIS_COMMIT__,
    // eslint-disable-next-line no-undef
    commitRange: __TRAVIS_COMMIT_RANGE__,
    // eslint-disable-next-line no-undef
    commitMessage: __TRAVIS_COMMIT_MESSAGE__,
    // eslint-disable-next-line no-undef
    repoSlug: __TRAVIS_REPO_SLUG__,
  };
}

import main from "./main";
main();
