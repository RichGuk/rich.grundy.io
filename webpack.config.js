const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = (env, options) => {
  const devMode = options.mode !== 'production';

  return {
    optimization: {
      minimizer: [
        new TerserPlugin({ parallel: true, sourceMap: devMode }),
        new OptimizeCSSAssetsPlugin({})
      ]
    },
    entry: {
      "app": [
        "./src/assets/js/app.js",
        "./src/assets/css/app.css"
      ]
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: devMode ? "js/[name].js" : "js/[name].[contenthash].js"
    },
    devtool: devMode ? 'source-map' : undefined,
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
          ],
        }
      ]
    },

    plugins: [
      new MiniCssExtractPlugin({ filename: devMode ? "css/[name].css" : "css/app.[contenthash].css" }),
      new ManifestPlugin({ publicPath: "/", fileName: "assets-manifest.json" }),
    ]
  }
};
