/**
 * Gulpfile
 *
 * @author Takuto Yanagida
 * @version 2022-08-13
 */

'use strict';

const gulp = require('gulp');
const $    = require('gulp-load-plugins')({ pattern: ['gulp-*'] });

const compile = () => gulp.src(['src/**/[^_]*.js'])
	.pipe($.plumber())
	.pipe($.include())
	.pipe($.rmLines({ filters: [/\/\/=/] }))
	.pipe($.replace(/^\t$/gm, ''))
	.pipe($.sourcemaps.init())
	.pipe($.terser())
	.pipe($.rename({ extname: '.min.js' }))
	.pipe($.sourcemaps.write('./map'))
	.pipe(gulp.dest('dist'));

const watch = done => {
	gulp.watch('src/**/*.js', gulp.series(compile));
	done();
};

exports.default = gulp.series(compile, watch);
