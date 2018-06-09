const path = require('path'),
  fs = require('fs'),

  webpack = require('webpack'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  CordovaHtmlOutputPlugin = require('../webpack/plugins/CordovaHtmlOutputPlugin.js'),
  UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
  CleanPlugin = require('clean-webpack-plugin'),
  ExtractTextPlugin = require("extract-text-webpack-plugin"),

  devServerPort = 8081

  let resolve = function (pt) {return path.resolve(__dirname, pt)};
  let webpackConfig = {
    resolve: {
      extensions: ['.js', '.json', '.vue'],
      modules: [path.join(__dirname, 'src'), 'node_modules'],
      alias: {
        'vue$': 'vue/dist/vue.common.js',
        'src': path.resolve(__dirname, '../src/'),
        'assets': path.resolve(__dirname, '../src/assets/'),
        'pages': path.resolve(__dirname, '../src/assets/vue/pages/'),
        'components': path.resolve(__dirname, '../src/assets/vue/components/')
      }
    },
    resolveLoader: {
      alias: {
        // necessary to to make lang="scss" work in test when using vue-loader's ?inject option
        // see discussion at https://github.com/vuejs/vue-loader/issues/724
        'scss-loader': 'sass-loader'
      }
    },
    output: {
      filename: '[hash].[name].js',
      path: path.join(__dirname, '../www')
    },

    devtool: '#inline-source-map',

    module: {
      rules: [
        {test: /\.html/, loader: 'html-loader'},
        {test: /\.(png|jpe?g|gif|ico)$/, loader: 'file-loader', options: {name: '[name].[ext]?[hash]'}},
        {test: /\.(woff2?|eot|ttf|otf|mp3|wav)(\?.*)?$/, loader: 'file-loader', options: {name: '[name].[ext]?[hash]'}},
        {test: /\.svg$/, loader: 'url-loader'},
        {test: /\.css$/, loader: [ 'vue-style-loader', 'css-loader']},
        {test: /\.scss$/, loader: [ 'vue-style-loader', 'css-loader', 'sass-loader']},
        {test: /\.sass$/, loader: [ 'vue-style-loader', 'css-loader', 'sass-loader?indentedSyntax']},
        {test: /\.vue$/, include: [resolve('../src'),resolve('../test'),resolve('../node_modules/vue-echarts/components/ECharts.vue')], loader: 'vue-loader', options: {loaders: {js: {loader: 'babel-loader', options: {presets: ['env'], plugins: ['transform-object-rest-spread']}}}}},
        {test: /\.js$/, exclude: /node_modules(\/|\\)(?!(framework7|framework7-vue|template7|dom7|vue-echarts|resize-detector)(\/|\\)).*/, use: {loader: 'babel-loader', options: {presets: ['env'], plugins: [ 'transform-runtime', 'transform-object-rest-spread' ]}}}
      ]
    },
    
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('test')
        }
      })
    ]
  }

module.exports = webpackConfig
