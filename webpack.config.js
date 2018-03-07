var path = require("path");
var webpack = require("webpack");

// var plugins = []; // if using any plugins for both dev and production
// var devPlugins = []; // if using any plugins for development

// var prodPlugins = [
//   new webpack.DefinePlugin({
//     'process.env': {
//       'NODE_ENV': JSON.stringify('production')
//     }
//   })
// ];

// plugins = plugins.concat(
//   process.env.NODE_ENV === 'production' ? prodPlugins : devPlugins
// )
module.exports = {
  context: __dirname,
  entry: "./frontend/small.jsx",
  output: {
    path: path.resolve(__dirname, "public", "javascripts"),
    filename: "bundle.js"
  },
  plugins: plugins,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015']
        }
      }
    ]
  },
  devtool: 'source-map',
  resolve: {
    extensions: [".js", ".jsx", "*"]
  }
};
