/* eslint-disable no-console */
/* eslint-env node */

const path = require('path');
const webpack = require('webpack');
// const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier'); // https://www.npmjs.com/package/webpack-build-notifier
const ExtractCssPlugin = require('mini-css-extract-plugin');

const rootPath = path.resolve(__dirname);
// const htmlPath = path.resolve(__dirname, 'html');
const srcPath = path.resolve(__dirname, 'src');
const buildPath = path.resolve(__dirname, 'build');

// // Common used style variables // XXX 2019.06.03, 12:41 -- Added by Igor
// const stylesConfig = require('./styles.config.js')

// // Less-specific variables (in form `@{name}`) // XXX 2019.06.03, 12:41 -- Added by Igor
// const lessConfig = Object.entries(stylesConfig)
//   .reduce((data, [key, val]) => Object.assign({ [`@${key}`]: val }, data), {})

module.exports = (env, argv) => {

  const { mode, watch } = argv;

  const srcEntry = 'index1.jsx';

  const htmlFilename = 'index.html';
  const htmlTemplateFile = './html/' + htmlFilename;

  // Build params...
  const isDevServer = !!argv.host; // (mode === 'none'); // (none = server) // Alternate method: !!argv.host;
  const cssHotReload = isDevServer; // Hot reload css for dev-server
  const isStats = !!argv.profile;
  const isWatch = !!argv.watch;
  const isDev = (/* isDevServer || */ mode === 'development');
  const isProd = !isDev; // mode === 'production';
  const useDevTool = true /* && (isDev || isDevServer) */; // Need server restart
  const minimizeBundles = true && isProd; // To minimize production bundles
  const preprocessBundles = false && !isStats && isProd; // To minimize production bundles
  const sourceMaps = !preprocessBundles; // To minimize production bundles
  const extemeUglify = false; // Use mangling (WARNING: May broke some code! Don't use without testing!)
  const DEBUG = true && (isDev || isDevServer);

  // Stats waiting only json on output...
  const debugModes = [
    // dateTag,
    // mode,
    isDevServer && 'DevServer',
    isWatch && 'Watch',
    isDev && 'Development',
    isProd && 'Production',
    useDevTool && 'DevTool',
    minimizeBundles && 'minmize',
    preprocessBundles && 'preprocess',
    sourceMaps && 'sourceMaps',
    extemeUglify && 'extemeUglify',
    DEBUG && 'DEBUG',
  ].filter(x => x).join(' ');
  if (!isStats) {
    !isStats && console.log('Build parameters:', debugModes); // eslint-disable-line no-console
  }

  const useHashes = false; // NOTE: Not works with pseudo-dynamic bundles loading method (with hardcoded urls)
  const bundleName = ({ ext, name, dir }={}) => (dir || 'js/') + (name || '[name]') + (useHashes && !isWatch && !isDevServer ? '-[contenthash:8]' : '') + (ext || '.js');

  return { // Configuration object...

    entry: path.join(srcPath, srcEntry),
    resolve: {
      extensions: ['.js', '.jsx'],
    },

    mode,
    watch: watch || false,

    devtool: useDevTool && 'source-map', // 'cheap-module-source-map',
    performance: {
      hints: false,
    },

    output: {
      path: buildPath,
      filename: bundleName(),
    },
    devServer: {
      contentBase: buildPath,
      index: htmlFilename,
      watchContentBase: true,
      port: 8080,
    },

    plugins: [

      !watch && !isDevServer && !isStats && new CleanWebpackPlugin(),

      /* new CopyPlugin([
       *   // (mode !== 'production') && { from: 'debug-data', to: './debug-data/' }, // Dev-server-only data stubs // XXX 2019.06.03, 12:41 -- Added by Igor
       *   // { from: css, to: buildPath },
       *   // { from: dirImg, to: './img/' },
       * ].filter(x => x)),
       */

      new HtmlWebPackPlugin({ // Process html entrypoint
        inject: true,
        template: htmlTemplateFile,
        filename: htmlFilename,
        templateParameters: {
          rootPath,
          // dateString,
          // dateTag,
          // version,
        },
      }),

      new webpack.NoEmitOnErrorsPlugin(),

      new WebpackBuildNotifierPlugin({ // XXX 2019.06.03, 12:40 -- Added by Igor
        // title: "My Project Webpack Build",
        // logo: path.resolve("./img/favicon.png"),
        suppressSuccess: true,
      }),

      // Extract styles for production build // XXX 2019.06.03, 12:40 -- Added by Igor
      !watch && new ExtractCssPlugin({
        filename: bundleName({ ext: '.css', dir: 'css/' }),
      }),

      // Pass constants to source code // XXX 2019.06.03, 12:40 -- Added by Igor
      new webpack.DefinePlugin({
        'process.env': {
          DEBUG: JSON.stringify(mode === 'development' || watch),
        },
      }),

    ].filter(x => x),

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader',
        },
        { // css/postcss
          test: /\.(pcss|css)$/,
          // exclude: /node_modules/, // Some imports may be from `node_modules/...`
          use: [
            cssHotReload ? 'style-loader' : ExtractCssPlugin.loader, // Hot styles realoading for dev-server
            { // css-loader
              loader: require.resolve('css-loader'),
              options: {
                sourceMap: sourceMaps,
              },
            },
            /* { // postcss-loader
             *   loader: require.resolve('postcss-loader'),
             *   options: {
             *     ident: 'postcss',
             *     sourceMap: sourceMaps,
             *     parser: require('postcss-scss'),
             *     plugins: () => postcssPlugins,
             *   },
             * },
             */
          ],
        },
      ],
    },

    optimization: {
      minimize: preprocessBundles ? false : minimizeBundles,
      minimizer: [
        new TerserPlugin({
          sourceMap: sourceMaps,
        }),
        new OptimizeCSSAssetsPlugin({
          sourceMap: sourceMaps,
        }),
      ],
      splitChunks: {
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
    },

    stats: {
      // Nice colored output
      colors: true,
    },

  };

};
