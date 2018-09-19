const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common');
const webpack = require('webpack');
const devConfig = require(path.join(__dirname, '../configs/dev.js'));

module.exports = merge(common, {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      __ENV__: JSON.stringify("DEVELOPMENT"),
      __API__: JSON.stringify(devConfig.api),
    })
  ],
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true
  },
  devtool: '#eval-source-map',
});
