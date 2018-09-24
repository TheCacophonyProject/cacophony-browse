const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const devConfig = require('../dev-config');


const distDir = path.resolve(__dirname, '../dist')

module.exports = merge(common, {
  mode: 'development',
  entry: './src/load.js',
  output: {
    path: distDir,
    publicPath: '/',
    filename: 'build.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      __ENV__: JSON.stringify(devConfig.environment),
      __API__: JSON.stringify(devConfig.api),
    }),
    new HtmlWebpackPlugin({
      template: 'index.template.ejs',
      inject: 'body',
    })
  ],
  devServer: {
    contentBase: distDir,
    historyApiFallback: true,
    noInfo: true,
    overlay: true
  },
  devtool: '#eval-source-map',
});
