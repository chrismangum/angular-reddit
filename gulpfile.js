var gulp = require('gulp'),
  coffee = require('gulp-coffee'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  jade = require('gulp-jade'),
  nodemon = require('gulp-nodemon'),
  stylus = require('gulp-stylus'),
  wiredep = require('wiredep').stream;

var paths = {
  js: 'public/js/*.coffee',
  jade: 'views/*.jade',
  stylus: 'public/css/*.styl',
  index: 'public/index.html',
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
    .pipe(jade({
      pretty: true
    }))
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

gulp.task('wiredep', function () {
  gulp.src(paths.index)
    .pipe(wiredep({
      fileTypes: {
        html: {
          replace: {
            js: '<script src="/static/{{filePath}}"></script>'
          }
        }
      }
    }))
    .pipe(gulp.dest('./public'));
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
  gulp.watch(paths.index, ['wiredep']);
});

gulp.task('default', ['scripts', 'jade', 'stylus', 'watch', 'nodemon']);
gulp.task('heroku:development', ['scripts', 'jade', 'stylus']);
