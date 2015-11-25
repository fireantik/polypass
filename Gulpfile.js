var gulp = require('gulp');
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
//var server = require('gulp-express');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');

var production = true;

function compile(src, watch) {
	var opts = {
		entries: src,
		cache: {},
		packageCache: {},
		transform: [
			["babelify", {
				presets: ["es2015", "react"]
			}]
		],
		debug: true
	};

	if(watch) opts.plugin = [watchify];

	var bundler = browserify(opts);

	function rebundle() {
		return bundler.bundle()
			.on('error', function(err) { console.error(err); this.emit('end'); })
			.pipe(source(src))
			.pipe(buffer())
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(gulpif(production, uglify()))
			.pipe(rename('app.js'))
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest('./static/js'));
	}

	if (watch) {
		bundler.on('update', function() {
			console.log('-> bundling...');
			rebundle();
		});
	}

	return rebundle();
}

gulp.task('app_js', function(){return compile('./client/app.jsx');});

gulp.task('less', function () {
	return gulp.src('./style/style.less')
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(gulpif(production, cssmin()))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./static/css'));
});

gulp.task('build', ['less', 'app_js']);

gulp.task('dev', function () {
	production = false;

	//server.run(['./server/index.js']);

	compile('./client/app.jsx', true);

	gulp.watch('style/**/*.less', ['less']);
	//gulp.watch(['./server/**/*.js', './common/**/*.js'], [server.run]);
});
