var webpack = require("webpack");
var path = require('path');

var production = false;

module.exports = {
    context: __dirname + "/client",
    entry: "./app.jsx",
    output: {
        path: __dirname + "/dist",
        filename: "[hash].js",
        //filename: "app.js",
        chunkFilename: "[chunkhash].js"
    },
    devtool: production ? "source-map" : "cheap-module-eval-source-map",
    plugins: [],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015']
                }
            },
            {
                test: /\.json$/,
                loader: 'json'
            }
        ]
    },
    node: {
        console: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }
};

if(production){
    module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }));
}