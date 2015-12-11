"use strict";

var gulp = require('gulp');
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var run = require('gulp-run');
var spawn = require('child_process').spawn;
var clean = require('gulp-clean');
var rev = require('gulp-rev');
var filenames = require("gulp-filenames");

var fs = require('fs');
var webpack = require("webpack");
var compiler = webpack(require('./webpack.config.js'));

var currentStyles = [];
var currentScripts = [];
var currentJsPreload = [];
var currentCssPreload = [];

function makeScript(url) {
	return "<script src='" + url + "'></script>\n";
}

function makeStyle(url) {
	return "<link rel='stylesheet' href='" + url + "'/>\n";
}

function addUrlPrefix(url) {
	return "/static/" + url;
}

function makeIndex(callback) {
	var preload = currentJsPreload.concat(currentCssPreload);
	fs.readFile(__dirname + '/index.html', function (err, html) {
		if (err) {
			console.log(err);
			throw err;
		}
		var scriptsHtml = currentScripts.map(addUrlPrefix).map(makeScript);
		var stylesHtml = currentStyles.map(addUrlPrefix).map(makeStyle);
		var preloadHtml = encodeURIComponent(JSON.stringify(preload.map(addUrlPrefix)));
		var currentHtml = html.toString('utf-8').replace('{{scripts}}', scriptsHtml).replace('{{styles}}', stylesHtml).replace('{{preload}}', preloadHtml);
		fs.writeFile('./static/index.html', currentHtml, function (err) {
			if (err) throw err;
			else {
				console.log("Rebundled.", new Date());
				if (callback) callback();
			}
		});
	});
}

function makeInfo(callback) {
	makeIndex(callback);
}

function reloadJSStats(callback, err, stats){
	if(err) {
		//console.log(err);
		throw err;
	}
	currentScripts = [stats.hash + ".js"];
	currentJsPreload = stats.compilation.chunks.filter(function(chunk){return !chunk.entry}).map(function(chunk){return chunk.files[0]});
	makeInfo(callback);
}

gulp.task("clean", function() {
	return gulp.src('./dist/', {read: false})
			.pipe(clean());
});

gulp.task("webpack", function(callback) {
	return compiler.run(reloadJSStats.bind(null, callback));
});

gulp.task("webpack_watch", function() {
	return compiler.watch({
		aggregateTimeout: 300
	}, reloadJSStats.bind(null, null));
});

var production = true;
var server = null;

gulp.task('less', function (cb) {
	gulp.src('./style/style.less')
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(gulpif(production, cssmin()))
		.pipe(rev())
		.pipe(filenames("css", {overrideMode: true}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist'))
		.on('end', function(){
			currentStyles = filenames.get("css");
			makeInfo(cb);
		});
});

gulp.task('default', ['less', 'webpack']);

gulp.task('server', function(){
	function start(){
		server = spawn('npm', ['start']);
		server.stdout.on('data', function(data){console.log(data.toString('utf-8'))});
		server.stderr.on('data', function(data){console.log(data.toString('utf-8'))});
	}

	if(server){
		server.kill('SIGKILL');
		server.on('exit', setTimeout.bind(null, start, 3000));
	}
	else start();
});

gulp.task('dev', ['clean', 'server', 'webpack_watch', 'less'], function () {
	production = false;

	gulp.watch('./style/**/*.less', ['less']);
	//gulp.watch(['./server/**/*.js', './common/**/*.js'], ['server']);
});


