'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _gulpBabel = require('gulp-babel');

var _gulpBabel2 = _interopRequireDefault(_gulpBabel);

var _gulpSourcemaps = require('gulp-sourcemaps');

var _gulpSourcemaps2 = _interopRequireDefault(_gulpSourcemaps);

var _gulpMocha = require('gulp-mocha');

var _gulpMocha2 = _interopRequireDefault(_gulpMocha);

var _gulpBabelIstanbul = require('gulp-babel-istanbul');

var _gulpBabelIstanbul2 = _interopRequireDefault(_gulpBabelIstanbul);

var _mergeStream = require('merge-stream');

var _mergeStream2 = _interopRequireDefault(_mergeStream);

/**
 * @param {Object} gulp
 */

exports['default'] = function (gulp) {
    gulp.task('test', function (done) {
        (0, _mergeStream2['default'])(gulp.src('./src/**/*.js').pipe((0, _gulpBabelIstanbul2['default'])()), gulp.src('./tests/**/*.js').pipe((0, _gulpBabel2['default'])())).pipe(_gulpBabelIstanbul2['default'].hookRequire()).on('finish', function () {
            gulp.src('./tests/**/*.js').pipe((0, _gulpMocha2['default'])()).pipe(_gulpBabelIstanbul2['default'].writeReports()).on('end', done);
        });
    });

    gulp.task('clean', function () {
        return (0, _del2['default'])('./dist');
    });

    gulp.task('copy', ['clean'], function () {
        return gulp.src('./src/**/*').pipe(gulp.dest('./dist'));
    });

    gulp.task('build', ['copy'], function () {
        return gulp.src('./src/**/*.js').pipe(_gulpSourcemaps2['default'].init()).pipe((0, _gulpBabel2['default'])()).pipe(_gulpSourcemaps2['default'].write('.')).pipe(gulp.dest('./dist'));
    });

    gulp.task('default', ['build']);
};

module.exports = exports['default'];