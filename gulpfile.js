const gulp = require('gulp');
const $    = require('gulp-load-plugins')({ pattern: ['gulp-*'] });

gulp.task('compile', () => {
	return gulp.src(['src/**/[^_]*.js'])
		.pipe($.plumber())
		.pipe($.include())
		.pipe($.deleteLines({ filters: [/\/\/=/] }))
		.pipe($.replace(/^\t$/gm, ''))
		.pipe($.sourcemaps.init())
		.pipe($.terser())
		.pipe($.rename({ extname: '.min.js' }))
		.pipe($.sourcemaps.write('./map'))
		.pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
	gulp.watch('src/**/*.js', gulp.series('compile'));
});

gulp.task('default', gulp.series('compile', 'watch'));
