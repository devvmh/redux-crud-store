import webpack from 'webpack';
import path from 'path';

const { NODE_ENV } = process.env;

const plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
  }),
];

const filename = `redux-crud-store${NODE_ENV === 'production' ? '.min' : ''}.js`;

NODE_ENV === 'production'  && plugins.push(
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      screw_ie8: true,
      warnings: false,
    },
  })
);

export default {
  module: {
    loaders: [
      { test: /\.js.flow$/, loaders: ['babel-loader'], exclude: /node_modules/ },
    ],
  },

  resolve: {
    // For consistent builds, it is important that '.js.flow' is first in the
    // list.
    extensions: ['.js.flow', '.js', '']
  },

  entry: [
    './src/index',
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename,
    library: 'ReduxCrudStore',
    libraryTarget: 'umd',
  },

  plugins,
};
