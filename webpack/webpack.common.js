const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')


module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: [
          path.resolve(__dirname, "src"),
          /\.js$/,
          require.resolve("bootstrap-vue")
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },
      {
        enforce: 'pre',
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        exclude: [/node_modules/]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(
      ["dist"],
      { root: path.resolve(__dirname, '..') }
    ),
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
};
