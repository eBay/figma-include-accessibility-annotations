const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

const defaultEnvKeys = ['ANALYTICS_URL', 'FEEDBACK_FORM_URL'];

module.exports = (env, argv) => {
  // call dotenv and it will return an Object with a parsed key
  const envFile = dotenv.config().parsed || {};

  defaultEnvKeys.forEach((key) => {
    if (!envFile[key]) {
      envFile[key] = '';
    }
  });

  // reduce it to a nice object, the same as before
  const envKeys = Object.keys(envFile).reduce((prev, next) => {
    const keys = { ...prev };
    keys[`process.env.${next}`] = JSON.stringify(envFile[next]);
    return keys;
  }, {});

  return {
    mode: argv.mode === 'production' ? 'production' : 'development',

    // this is necessary because Figma's 'eval' works differently than normal eval
    devtool: argv.mode === 'production' ? false : 'inline-source-map',
    devServer: {
      open: ['/ui.html']
      // static: {
      //   directory: path.join(__dirname, 'dist')
      // }
    },

    entry: {
      ui: './src/ui.js', // entry point for ui code
      code: './src/code.js' // entry point for plugin code
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              envName: argv.mode === 'production' ? 'production' : 'development'
            }
          }
        },
        // enables including CSS by doing "import './file.css'" in your code
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        // enables including SCSS by doing "import './file.scss'" in your code
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            'style-loader',
            // Translates CSS into CommonJS
            'css-loader',
            // Compiles Sass to CSS
            // 'sass-loader'
            {
              loader: 'sass-loader',
              options: {
                // Use Dart Sass
                implementation: require('sass')
              }
            }
          ]
        },
        // allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
        // { test: /\.(png|jpg|gif|webp|svg|zip)$/, loader: [{ loader: 'url-loader' }] }
        {
          test: /\.svg/,
          type: 'asset/inline'
        }
      ]
    },

    // webpack tries these extensions for you if you omit the extension like "import './file'"
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      },
      extensions: ['.js', '.json']
    },

    output: {
      filename: '[name].js',
      path: path.join(__dirname, 'dist'), // compile into a folder called "dist"
      publicPath: '/'
    },

    // tells webpack to generate "ui.html" and to inline "ui.js" into it
    plugins: [
      new webpack.DefinePlugin({
        global: {}, // fix missing symbol error when running in developer VM
        ...envKeys,
        'process.env.VERSION': JSON.stringify(process.env.npm_package_version),
        'process.env.ISPROD': argv.mode === 'production'
      }),
      new HtmlWebpackPlugin({
        cache: false, // https://github.com/figma/plugin-samples/pull/88/commits/ba20d48aace9931ce7ab53753cf87aa297435de1
        inject: 'body',
        template: './src/ui.html',
        filename: 'ui.html',
        chunks: ['ui']
      }),
      new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/ui/])
    ]
  };
};
