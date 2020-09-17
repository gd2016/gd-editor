'use strict'
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
// const I18nPlugin = require('@ah/i18n/src/plugins/webpack')
const port = 8080
module.exports = {
  mode: 'development',
  entry: {
    app: './test/test.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
      test: /\.less$/,
      use: [
        {
          loader: 'style-loader' // creates style nodes from JS strings
        },
        {
          loader: 'css-loader' // translates CSS into CommonJS
        },
        {
          loader: 'less-loader', // compiles Less to CSS
          options: {
            globalVars: {
              imgSrc: process.env.NODE_ENV === 'development' ? './' : '__STATIC_COMMON__'
            }
          }
        }

      ]
    },
    {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: path.resolve(__dirname, 'dist/img/[name].[hash:7].[ext]')
      }
    }
    ]
  },
  devServer: {
    clientLogLevel: 'warning',
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: '0.0.0.0',
    port: port,
    publicPath: '/',
    proxy: {
      '/api': 'http://10.4.40.54'
    },
    after (app) {
      console.log(`Your application is running here: http://localhost:${port}`)
    },
    quiet: true // necessary for FriendlyErrorsPlugin
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'CTIME TEST',
      template: 'test/test.html'
    })
    // new CopyWebpackPlugin([{
    //   from: path.resolve('./static'),
    //   to: 'static',
    //   ignore: ['.*']
    // }])
    // new I18nPlugin({
    //   output: path.join(__dirname, './src/i18n/output'),
    //   type: 'js',
    //   source: path.join(__dirname, './src/i18n/langs')
    // })
  ]
}
