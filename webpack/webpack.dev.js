const merge = require("webpack-merge");
const path = require("path");
const common = require("./webpack.common");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const devConfig = require("../dev-config");

const distDir = path.resolve(__dirname, "../dist");
module.exports = merge(common, {
  mode: "development",
  entry: { load: "./src/load.js" },
  output: {
    path: distDir,
    publicPath: "/",
    filename: "build.js",
  },
  plugins: [
    new webpack.DefinePlugin({
      __ENV__: JSON.stringify(devConfig.environment),
      __API__: JSON.stringify(devConfig.api),
      __LINZ_API_KEY__: JSON.stringify(devConfig.linzBasemapApiKey)
    }),
    new HtmlWebpackPlugin({
      template: "index.template.ejs",
      inject: "body",
    }),
  ],
  devServer: {
    contentBase: distDir,
    hot: true,
    stats: {
      minimal: true,
      assets: false,
      modules: false,
      timings: true,
    },
  },
  devtool: "eval-cheap-module-source-map",
});
