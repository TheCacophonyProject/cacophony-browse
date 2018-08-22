const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'production',
  devtool: '#source-map',
  entry: './src/main.js',
  plugins: [
    new webpack.DefinePlugin({
      ENV: JSON.stringify(require(path.join(__dirname, '../configs/staging.js')))
    })
  ]
});
