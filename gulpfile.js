var gulp = require('gulp'),
  plugin = require('gulp-load-plugins')({
    camelize: true
  }),
  wiredep = require('wiredep').stream;

var paths = {
  clientJS: 'public/js/*.coffee',
  serverJS: 'server/*.coffee',
  jade: 'views/*.jade',
  stylus: 'public/css/*.styl',
  index: 'public/index.jade'
};

gulp.task('clientJS', function () {
  gulp.src(paths.clientJS)
    .pipe(plugin.coffee())
    .pipe(gulp.dest('public/js'));
});

gulp.task('serverJS', function () {
  gulp.src(paths.serverJS)
    .pipe(plugin.coffee())
    .pipe(gulp.dest('server'));
});

gulp.task('jade', function () {
  gulp.src(paths.jade)
    .pipe(plugin.jade({
      pretty: true
    }))
    .pipe(gulp.dest('public/'));
});

gulp.task('stylus', function () {
  gulp.src(paths.stylus)
    .pipe(plugin.stylus({
      set: ['compress'],
      use: ['nib']
    }))
    .pipe(gulp.dest('public/css'));
});

gulp.task('wiredep', function () {
  gulp.src(paths.index)
    .pipe(plugin.jade({
      pretty: true
    }))
    .pipe(wiredep({
      exclude: [
        'public/vendor/mockfirebase',
        'public/vendor/firebase-simple-login'
      ],
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
  plugin.nodemon({
    script: 'server/app.js',
    ext: 'js',
    ignore: ['public/**', 'node_modules/**']
  });
});

gulp.task('watch', function () {
  gulp.watch(paths.clientJS, ['clientJS']);
  gulp.watch(paths.serverJS, ['serverJS']);
  gulp.watch(paths.jade, ['jade']);
  gulp.watch(paths.stylus, ['stylus']);
  gulp.watch(paths.index, ['wiredep']);
});

gulp.task('views', ['jade', 'wiredep']);
gulp.task('scripts', ['clientJS', 'serverJS']);
gulp.task('default', ['scripts', 'views', 'stylus', 'watch', 'nodemon']);
gulp.task('heroku:development', ['scripts', 'views', 'stylus']);
