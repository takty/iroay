/**
 * Gulpfile
 *
 * @author Takuto Yanagida
 * @version 2022-12-16
 */

import gulp from 'gulp';
import changed from 'gulp-changed';
import plumber from 'gulp-plumber';
import preprocess from 'gulp-preprocess';
import rename from 'gulp-rename';
import terser from 'gulp-terser';

const compile = () => gulp.src('src/**/[^_]*.js', { sourcemaps: true })
	.pipe(plumber())
	.pipe(preprocess())
	.pipe(terser())
	.pipe(rename({ extname: '.min.js' }))
	.pipe(changed('dist', { hasChanged: changed.compareContents }))
	.pipe(gulp.dest('dist', { sourcemaps: '.' }));

const watch = () => {
	gulp.watch('src/**/*.js', gulp.series(compile));
};

export default gulp.series(compile, watch);
