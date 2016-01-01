var webpack = require("webpack");
var path = require('path');

var production = process.env.NODE_ENV == "prod" || process.env.NODE_ENV == "production";

module.exports = {
	context: __dirname + "/client",
	entry: {
		app: "./app.jsx"
	},
	output: {
		path: __dirname + "/dist",
		filename: "[chunkhash].[name].entry.js",
		//filename: "app.js",
		chunkFilename: "[chunkhash].js"
	},
	devtool: production ? "source-map" : "cheap-module-eval-source-map",
	plugins: [],
	module: {
		loaders: [
			{
				test: /\.jsx$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel',
				query: {
					presets: ['react', 'es2015']
				}
			},
			{
				test: /\.es6$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel',
				query: {
					presets: ['es2015']
				}
			},
			{
				test: /\.json$/,
				loader: 'json'
			},
			{
				test: /\.less$/,
				loader: "style!css!less"
			},
			{
				test: /\.scss$/,
				loaders: ["style", "css", "sass"]
			},
			{test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'},
			{test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'},
			{test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
			{test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml'}
		]
	},
	node: {
		crypto: false
	},
	resolve: {
		alias: {
			crypto: require.resolve("crypto-browserify")
		}
	}
};

if (production) {
	module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false
		}
	}));
	module.exports.plugins.push(new webpack.optimize.DedupePlugin());
}
