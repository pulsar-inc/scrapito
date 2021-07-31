const path = require('path');
const ThreadsPlugin = require('threads-plugin');

module.exports = {
  entry: './index.ts',
  plugins: [new ThreadsPlugin()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    globalObject: 'self',
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
