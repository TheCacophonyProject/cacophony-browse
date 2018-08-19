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

# Production

Create the distribution file
``` bash
npm run build
```

The index.html file in the root of the project should be served via a web server, an express example might look as follows:

```javascript
const express = require('express');
const app = express();
const path = require('path');

app.use('/dist', express.static(path.join(__dirname, '../cacophony-web-vuex/dist')));
app.use('/*', express.static(path.join(__dirname, '/')));

app.listen(3000, () => console.log('Listening on port 3000!'));
```
