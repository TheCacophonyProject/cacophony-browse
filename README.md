# cacophony-web-vue

This is a reimplementation of the [Cacophony Project web UI](https://github.com/TheCacophonyProject/cacophony-web/) using modern practices. It is based on the [Vue](https://vuejs.org) framework and uses [Vuex](https://vuex.vuejs.org) for state management.


## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).


# Development

Please follow the Vue style guide for all development:
https://vuejs.org/v2/style-guide/#ad

# Production Releases

* Ensure all changes have been merged and are pulled into the local copy.
* Update the version number and tag the new version with: `npm version <new-version>`
* Push the tag to Github: `git push origin <version>`
* Build the distribution: `npm run build`
* Build the deb package: `nfpm pkg -t cacophony-web-vuex_<version>.deb`
* Upload the resulting package to the [Github Releases](https://github.com/TheCacophonyProject/cacophony-web-vuex/releases) for cacophony-web-vuex

The /srv/cacophony/cacophony-web-vuex directory in the package should
be served by a web server.
