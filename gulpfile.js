var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var ngAnnotate = require('gulp-ng-annotate');
var inject = require("gulp-inject");
var sh = require('shelljs');

var paths = {
  sass: ['./scss/**/*.scss']
};

var appJS = [
    './app/buid_head.js',
    './app/js/app.js',
    './app/js/**/*-module.js',
    './app/js/**/*.js',
    './app/buid_foot.js'
];

// uglify task
gulp.task('js', function() {
    // Concatenate AND minify app sources
    var appStream = gulp.src(appJS)
        .pipe(concat('app.js'))
        .pipe(ngAnnotate())
        //.pipe(uglify())
        .pipe(gulp.dest('./www/js'));


    gulp.src('./app/index.html')
        .pipe(inject(appStream, {starttag: '<!-- inject:app:{{ext}} -->', ignorePath: '/www/'}))
        .pipe(gulp.dest('./www'));
});

gulp.task('move', function () {
  gulp
    .src(['./app/templates/**/*.html'])
    .pipe(gulp.dest('./www/templates'));

  gulp
    .src(['./app/js/**/*.json'])
    .pipe(gulp.dest('./www/data'));
});

gulp.task('default', ['sass', 'watch']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

var base = { base: './src/app/' };

gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);

    gulp.watch([
      './app/**/*.html',
      './app/**/*.js',
	  './scss/**/*.scss'
    ], ['build']);
});

gulp.task('build', ['sass', 'move', 'js']);
