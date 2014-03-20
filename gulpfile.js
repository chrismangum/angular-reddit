var gulp = require('gulp'),
  coffee = require('gulp-coffee'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  jade = require('gulp-jade'),
  nodemon = require('gulp-nodemon');

var paths = {
  js: 'public/js/*.coffee',
  jade: 'views/index.jade'
};

gulp.task('scripts', function () {
  return gulp.src(paths.js)
    .pipe(coffee())
    .pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('jade', function () {
  return gulp.src(paths.jade)
    .pipe(jade())
    .pipe(gulp.dest('public/'));
});

gulp.task('nodemon', function () {
  nodemon({
    script: 'server/app.js',
    ext: 'js,coffee',
    ignore: ['public/**']
  });
});

gulp.task('watch', function () {
  gulp.watch(paths.js, ['scripts']);
  gulp.watch(paths.jade, ['jade']);
});

gulp.task('default', ['scripts', 'jade', 'watch', 'nodemon']);
