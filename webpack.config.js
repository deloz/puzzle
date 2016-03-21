'use strict';

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    index: './src/js/index.js',
  },
  output: {
    path: './dist/',
    publicPath: '/dist/',
    filename: 'js/[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader'),
      }, {
        test: /\.(png|jpe?g|gif)$/,
        loader: 'url?limit=40000&name=images/[hash].[ext]',
      }, {
        test: /\.js$/,
        loader: 'babel',
        query: {
          presets: [
            'es2015',
            'stage-0',
          ],
        },
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.json'],
  },
  plugins: [
    new ExtractTextPlugin('css/[name].css', {
      allChunks: true,
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      output: {
        comments: false,
      },
    }),
  ],
};
