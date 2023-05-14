var webpack = require('webpack');
var path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const root = path.resolve(__dirname, '..');

module.exports = {
  mode: 'development',
  // entry: {
  //   'basic': [
  //     'webpack-dev-server/client?http://localhost:8080/',
  //     'webpack/hot/only-dev-server',
  //     './example/bundle.js'
  //   ]
  // },
  entry: ['./example/bundle.js'],
  output: {
    path: __dirname,
    //path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[fullhash].js',
    publicPath: 'http://localhost:8080/',
    chunkFilename: '[id].chunk.js',
    sourceMapFilename: '[name].map'
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.es6'],
    modules: ['node_modules']
  },
  module: {
    rules: [
      {
        test: /\.jsx$|\.es6$|\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: "defaults" }]
            ]
          }
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      { test: /\.(jpe?g|png|gif)$/i, type: 'asset/resource' },
      { test: /\.json/, type: 'json', exclude: /node_modules/ }
    ]
  },
  plugins: [
    // new webpack.NoEmitOnErrorsPlugin(),
    // new webpack.NormalModuleReplacementPlugin(
    //   /node_modules\/antd\/lib\/style\/index\.less/,
    //   path.resolve(root, 'src/less/antd-globals-hiding-hack.less')
    // ),
    new HtmlWebpackPlugin({
      template: 'example/index.html',
    }),
    // new WebpackPluginServe({
    //   host: 'localhost',
    //   port: 8080,
    //   historyFallback: true,
    //   open: true,
    //   liveReload: false,
    //   hmr: true,
    //   static: './dist',
    // }),
  ],
  devServer: {
    allowedHosts: 'auto',
    client: {
      overlay: true,
    },
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.resolve(root, 'src/css'),
    },
  },
  devtool: "eval"
};
