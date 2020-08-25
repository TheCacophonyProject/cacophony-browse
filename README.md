# cacophony-browse

This is a web interface for querying with and interacting with Cacophony Project recordings using the project's API. It is based on the [Vue](https://vuejs.org) framework and uses [Vuex](https://vuex.vuejs.org) for state management.


## Build Setup

``` bash
# install dependencies
npm install

# create config file
cp dev-config.js.TEMPLATE dev-config.js
# now edit the config file to point to correct API server

# serve with hot reload at localhost:8080
npm run dev

# build for staging & production with minification
npm run release
```

For detailed explanation on how things work, consult the [docs for
vue-loader](http://vuejs.github.io/vue-loader).

# Development

Please follow the Vue style guide for all development:
https://vuejs.org/v2/style-guide/#ad

The project is configured to use eslint and prettier. Please ensure
your development setup included a recent version of prettier. Pull
requests will be checked to ensure there are no code formatting or
eslint issues.

To run eslint:
```
npm run lint
```

To run eslint and automatically fix issues:
```
npm run lint:fix
```

# Releases

* Ensure all changes have been merged and are pulled into the local copy.
* Tag the release (starting with a "v"), e.g.: `git tag -a v1.2.3 -m "1.2.3 release"`
* Push the tag to Github, e.g.: `git push origin v1.2.3`
* TravisCI will run the tests, create a release package and create a
  [Github Release](https://github.com/TheCacophonyProject/cacophony-browse/releases)

## Web Server Configuration

The /srv/cacophony/cacophony-browse directory in the release package
should be served by a web server.

Sample configuration for the [Caddy](https://caddyserver.com/) web server:

```
# Update the host and port to match desired
http://localhost:9000 {
    gzip
    root  /srv/cacophony/cacophony-browse

    rewrite {
        ext !.jpg !.png !.svg !.js
        to /index-prod.html  # or index-staging.html
    }
}
```
