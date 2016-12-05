module.exports = {
    entry: './src/index.js',
    output: {
      path: __dirname,
      filename: 'bundle.js'
    },
    devtool: 'inline-source-map',
    devServer: {
      inline: true,
    },
    module: {
      loaders: [{
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }]
    }
};
