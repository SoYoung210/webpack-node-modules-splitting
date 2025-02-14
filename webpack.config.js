const webpack = require('webpack');
const join = require('path').join;
const pathJoin = path => join(__dirname, path);
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const crypto = require('crypto');

const isModuleCSS = (module) => {
  return module.type === 'css/mini-extract';
};

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
    devServer: {
      contentBase: pathJoin('static'),
      compress: true,
      port: 9000,
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
      path: pathJoin('./static/resources'),
      filename: '[name].bundle.js',
      chunkFilename: '[name].bundle.js',
      path: pathJoin('./static/resources'),
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
        template: pathJoin(`./public/index.html`),
        filename: './index.html',
      }),
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
        cacheGroups: {
          default: false,
          vendors: false,
          // vendors was renamed to defaultVendors
          defaultVendors: false,
          framework: {
            chunks: 'all',
            name: 'framework',
            // eslint-disable-next-line max-len
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return (
                module.size() > 80000 &&
                /node_modules[/\\]/.test(module.identifier())
              );
            },
            name(module) {
              const hash = crypto.createHash('sha1');
              if (isModuleCSS(module)) {
                module.updateHash(hash);

                return hash.digest('hex').substring(0, 8);
              } else {
                if (!module.libIdent) {
                  throw new Error(
                    `Encountered unknown module type: ${module.type}. Please open an issue.`,
                  );
                }
              }

              hash.update(module.libIdent({ context: __dirname }));

              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 1, // entry points length
            priority: 20,
          },
        },
        maxInitialRequests: 25,
        minSize: 20000,
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
