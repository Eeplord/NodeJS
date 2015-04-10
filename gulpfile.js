// gulpfile.js

var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var watch = require('gulp-watch');
var jshint = require('gulp-jshint');
var livereload = require('gulp-livereload');
var _paths = ['server/**/*.js', 'public/javascripts/*.js'];

// register nodemon task
gulp.task('nodemon', function() {
    nodemon({
	script: 'server/app.js',
	env: {
	    'NODE_ENV': 'development'
	}
    })
	.on('restart');
});

// rerun the task when a file changes
gulp.task('watch', function() {
    livereload.listen();

    gulp.src(_paths, {
	read: false
    })
	.pipe(watch({
	    emit: 'all'
	}))
	.pipe(jshint())
	.pipe(jshint.reporter('default'));

    gulp.watch(_paths).on('change', livereload.changed);
});

// lint js files
gulp.task('lint', function() {
    gulp.src(_paths)
	.pipe(jshint())
	.pipe(jshint.reporter('default'));
});

// default task
gulp.task('default', ['lint', 'nodemon', 'watch'])
