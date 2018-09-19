const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common');
const webpack = require('webpack');
const devConfig = require(path.join(__dirname, '../dev.js'));

module.exports = merge(common, {
  mode: 'development',
  entry: './src/load.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      __ENV__: JSON.stringify(devConfig.environment),
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
