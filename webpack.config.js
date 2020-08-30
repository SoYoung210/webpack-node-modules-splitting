const webpack = require('webpack');
const join = require('path').join;
const pathJoin = path => join(__dirname, path);
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');

module.exports = (env, argv) => {
  const isProductEnv = argv.mode === 'production';

  const config = {
    entry: pathJoin('src/index.tsx'),
    resolve: {
      alias: {
        '@': pathJoin('src'),
      },
      extensions: ['css', '.ts', '.tsx', '.js', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js)?$/,
          exclude: /(node_modules|__test__)/,
          use: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
          ],
        },
      ],
    },
    output: {
      path: pathJoin('../static/resources'),
      filename: '[name].bundle.js',
      chunkFilename: '[name].bundle.js',
      path: pathJoin('../static/resources'),
      publicPath: '/',
    },
    plugins: [
      new CompressionWebpackPlugin({
        test: new RegExp(`\\.(${ ['js', 'ts', 'css', 'html'].join('|') })$`),
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        threshold: 8192,
        cache: true,
      }),
      new MiniCssExtractPlugin({
        filename: `[name].bundle.css`,
        chunkFilename: `[name].bundle.css`,
      }),
      new HtmlWebpackPlugin({
        template: pathJoin(`./public/index.pug`),
        filename: '../index.pug',
      }),
      new HtmlWebpackPugPlugin(),
    ],
    optimization: {
      minimize: isProductEnv,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 6,
              warnings: false,
              comparisons: false,
              inline: 2,
            },
            keep_classnames: isProductEnv,
            keep_fnames: isProductEnv,
            output: {
              ecma: 6,
              comments: false,
              ascii_only: true,
            },
          },
        }),
        new OptimizeCSSAssetsPlugin({
          assetNameRegExp: /\.min\.css$/g,
          cssProcessor: require('cssnano'),
          cssProcessorPluginOptions: {
            preset: [
              'default',
              { discardComments: { removeAll: true }},
              { minifyFontValues: { removeQuotes: false }},
            ],
          },
          canPrint: true,
        }),
      ],
      splitChunks: {
        chunks: 'all',
        name: 'vendors',
      },
    },
  };


  if (argv.watch) {
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerPort: 9090,
      }),
    );
  }

  return config;
};
