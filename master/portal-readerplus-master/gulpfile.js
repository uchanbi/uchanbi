var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var gutil = require('gulp-util');
var less = require('gulp-less');
var min = require('gulp-usemin');
var minifyCSS = require('gulp-minify-css');
var ngmin = require('gulp-ngmin');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var assets = require("gulp-assets");
var htmlreplace = require('gulp-html-replace');
var replace = require('gulp-replace');
var connect = require('connect');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');
var open = require("gulp-open");
var exec = require('child_process').exec;
var runSequence = require('run-sequence');
var Seed = require('./server/services/seed');
var async = require('async');
var child_process = require('child_process');
var nightwatch = require('gulp-nightwatch');
var moment = require('moment');
var server;
var nightwatchCliArgs = process.platform === 'win32' ? '--skiptags timeout,windows' : '--skiptags timeout';

gulp.task('env:test', function () {
  return process.env.NODE_ENV = 'test';
});

gulp.task('seed:e2e', function(cb){
  Seed('e2e', function(err){
    console.log('finished seeding')
    cb(err);
  });
});

gulp.task('seed:qa', function(cb){
  Seed('qa', function(err){
    cb(err);
  });
});

gulp.task('test', function(cb) {
  runSequence('env:test', 'seed:e2e', 'build:test', 'coverage:clean', 'instrument', 'server:start', 'night', 'report', 'server:stop', cb);
});

gulp.task('server:start', function (cb) {
  server = require('./server/server.js');
  server.start(function() {
    cb()
  });
});

gulp.task('server:stop', function (cb) {
  server.stop(function() {
    process.exit(0);
    cb();
  });
});

gulp.task('night', function() {
  return gulp.src('')
  .pipe(nightwatch({
    configFile: 'test/e2e/config/nightwatch.json',
    cliArgs: [nightwatchCliArgs]
  }));
});

gulp.task('instrument', function (cb) {
  exec('istanbul instrument app -o test-build -x "**/components/**"', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('coverage:clean', function (cb) {
  var dirPath = 'test/coverage/reports/';
  var files = fs.readdirSync(dirPath);
  files.forEach(function(fileName) {
    if(fileName.substr(fileName.length - 4) === 'json') {
      fs.unlinkSync(dirPath + fileName);
    }
  });
  cb();
});

gulp.task('report', function (cb) {
  exec('istanbul report --root test/coverage/reports/ --dir app/coverage/', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('less', function () {
  return gulp.src('./app/styles/main.less')
  .pipe(less({
    paths: ['app/styles']
  }))
  .pipe(min({
    cssmin: true
  }))
  .pipe(gulp.dest('./app/css'));
});

gulp.task('jsMin', function () {
  return gulp.src("app/index.html")
    .pipe(assets({
        js: true,
        css: false
    }))
    .pipe(ngmin())
    .pipe(uglify({mangle: false}))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('cssmin', function (cb) {
  return gulp.src('app/index.html')
    .pipe(assets({
        js: false,
        css: true
    }))
    .pipe(replace('src:url(ui-grid', 'src:url(../fonts/ui-grid'))
    .pipe(minifyCSS())
    .pipe(concat('main.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(gulp.dest('test-build/css'));
});

gulp.task('copy', function(cb){
  return gulp.src(['app/views/**/*', 'app/downloads/**/*', 'app/modules/**/*.html', 'app/fonts/**/*', 'app/img/**/*'], {base : './app'})
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('test-build'));
});

gulp.task('copy:test', function(cb){
  return gulp.src(['app/components/**/*', 'app/modules/**/*', 'app/index.html'], {base : './app'})
    .pipe(gulp.dest('test-build'));
});

gulp.task('copy-images', function(cb){
  return gulp.src('app/styles/images/**/*')
    .pipe(gulp.dest('dist/css/images'))
    .pipe(gulp.dest('test-build/css/images'));
});

gulp.task('jshint', function() {
  gulp.src('./app/scripts/**/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});

var package = require(require('path').resolve('./package'));
var build = require(require('path').resolve('./build'));

gulp.task('replace-html', function (cb) {
  return gulp.src('app/index.html')
    .pipe(htmlreplace({
        'js': 'js/main.js',
        'css': 'css/main.css',
        'build': '<!-- Built: ' + moment().format("dddd, Do MMMM YYYY, h:mm:ss a") + ' -->',
        'version': 'Version: ' + package.version + ' - build:<span id="buildId"></span>'
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task("open", function(){
  var options = {
    url: "http://localhost:3000/#/"
  };
  gulp.src("app/index.html")
  .pipe(open("", options));
});

gulp.task("open-build", function(){
  var options = {
    url: "http://localhost:3000/#/"
  };
  gulp.src("dist/index.html")
  .pipe(open("", options));
});

gulp.task('default', ['server:start', 'seed:e2e', 'open'], function() {
  livereload.listen();
  gulp.watch('app/styles/*.less', ['less']).on('change', livereload.changed);
  gulp.watch('app/**/*.js', ['jshint']).on('change', livereload.changed);
  gulp.watch('app/**/*.html').on('change', livereload.changed);
});

gulp.task('build',          ['less', 'jsMin', 'cssmin', 'copy', 'copy-images', 'replace-html']);
gulp.task('build:test',     ['build', 'copy:test']);
gulp.task('build:preview',  ['build', 'server:start', 'open-build']);
