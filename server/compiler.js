"use strict";

var webpack = require("webpack");
var compiler = webpack(require(__dirname + '/../webpack.config.js'));
var rimraf = require('rimraf');
var fs = require('fs');
var path = require('path');

module.exports = {
	files: [],
	entries: {}
};


function readOriginal(cb){
	fs.readdir(compiler.outputPath, function(err, files){
		if(err) throw err;
		var fil = {};
		for(var i in files){
			fil[files[i]] = path.join(compiler.outputPath, files[i]);
		}

		parseFiles(fil);
		if(cb) cb();
	});
}

function parseFiles(filemap, removeOld){
	var files = Object.keys(filemap);
	var oldFiles = Object.keys(module.exports.files);

	var entries = {};
	for(var i in files){
		let match = /\.(.*)\.entry\.(?!.*\.map)/.exec(files[i]);
		if(match && match[1]){
			entries[match[1]] = files[i];
		}
	}

	if(removeOld){
		for(var i in oldFiles){
			var curFile = oldFiles[i];
			if(files.indexOf(curFile) == -1) fs.unlink(module.exports.files[curFile]);
		}
	}

	module.exports.files = filemap;
	module.exports.entries = entries;
}

function compiled(err, stats){
	if(err) throw err;
	var files = {};
	for(var i in stats.compilation.assets){
		files[i] = stats.compilation.assets[i].existsAt;
	}

	console.log("Compiled. Took " + (stats.endTime - stats.startTime) + " ms.");
	parseFiles(files, true);
}


module.exports.watch = function(){
	readOriginal(function(){
		compiler.watch({}, compiled);
	});
};

module.exports.build = function(){
	readOriginal(function(){
		compiler.run(compiled);
	});
};

module.exports.readOnly = function(){
	readOriginal();
};
