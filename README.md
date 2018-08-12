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

Serve an index.html file as follows from your chosen server:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Cacophony</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body>
<div id="app"></div>
<script src="http://localhost:3000/dist/build.js"></script>
</body>
</html>
```

An express app for example:

```javascript
const express = require('express');
const app = express();
const path = require('path');

app.use('/dist', express.static(path.join(__dirname, '../cacophony-web-vuex/dist')));
app.use('/*', express.static(path.join(__dirname, '/')));

app.listen(3000, () => console.log('Listening on port 3000!'));
```
