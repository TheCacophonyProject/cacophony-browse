const merge = require('webpack-merge');
const common = require('./webpack.config');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: '#source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true
      })
    ]
  }
});
