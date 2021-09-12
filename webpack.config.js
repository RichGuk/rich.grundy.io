const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = (env, options) => {
  const devMode = options.mode !== 'production';

  return {
    mode: devMode ? 'development' : 'production',
    optimization: {
      minimizer: [new TerserPlugin({ parallel: true }), new CssMinimizerPlugin()],
    },
    entry: {
      app: ['./src/assets/js/app.js', './src/assets/css/app.css'],
      photography: ['./src/assets/js/photography.js'],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: devMode ? 'assets/js/[name].js' : 'assets/js/[name].[contenthash].js',
    },
    devtool: devMode ? 'source-map' : undefined,
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: { url: false },
            },
            'postcss-loader',
          ],
        },
      ],
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: devMode ? 'assets/css/[name].css' : 'assets/css/app.[contenthash].css',
      }),
      new WebpackManifestPlugin({ publicPath: '/', fileName: 'assets-manifest.json' }),
    ],
  };
};
