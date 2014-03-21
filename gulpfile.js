var gulp = require('gulp'),
  coffee = require('gulp-coffee'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  jade = require('gulp-jade'),
  nodemon = require('gulp-nodemon'),
  stylus = require('gulp-stylus');

var paths = {
  js: 'public/js/*.coffee',
  jade: 'views/*.jade',
  stylus: 'public/css/*.styl',
};

gulp.task('scripts', function () {
  gulp.src(paths.js)
    .pipe(coffee())
    .pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('jade', function () {
  gulp.src(paths.jade)
    .pipe(jade())
    .pipe(gulp.dest('public/'));
});

gulp.task('stylus', function () {
  gulp.src(paths.stylus)
    .pipe(stylus({
      set: ['compress'],
      use: ['nib']
    }))
    .pipe(gulp.dest('public/css'));
});

gulp.task('nodemon', function () {
  nodemon({
    script: 'server/app.js',
    ext: 'js,coffee',
    ignore: ['public/**', 'node_modules/**']
  });
});

gulp.task('watch', function () {
  gulp.watch(paths.js, ['scripts']);
  gulp.watch(paths.jade, ['jade']);
  gulp.watch(paths.stylus, ['stylus']);
});

gulp.task('default', ['scripts', 'jade', 'stylus', 'watch', 'nodemon']);
