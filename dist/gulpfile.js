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

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _canonical = require('canonical');

var _canonical2 = _interopRequireDefault(_canonical);

/**
 * @param {Object} gulp
 * @returns {undefined}
 */

exports['default'] = function (gulp) {
    var watching = undefined;

    watching = false;

    gulp.task('pragmatist:lint', function () {
        return (0, _globby2['default'])(['./src/**/*.js', './tests/**/*.js']).then(function (paths) {
            var formatter = undefined,
                report = undefined;

            formatter = (0, _canonical.getFormatter)();
            report = (0, _canonical.lintFiles)(paths);

            if (report.errorCount || report.warningCount) {
                console.log(formatter(report));
            }
        });
    });

    gulp.task('pragmatist:clean', ['pragmatist:lint'], function () {
        return (0, _del2['default'])('./dist');
    });

    gulp.task('pragmatist:copy', ['pragmatist:clean'], function () {
        return gulp.src('./src/**/*').pipe(gulp.dest('./dist'));
    });

    gulp.task('pragmatist:build', ['pragmatist:copy'], function () {
        return gulp.src('./src/**/*.js').pipe(_gulpSourcemaps2['default'].init()).pipe((0, _gulpBabel2['default'])({
            stage: 0,
            plugins: [require.resolve('babel-plugin-lodash')]
        })).pipe(_gulpSourcemaps2['default'].write('.')).pipe(gulp.dest('./dist'));
    });

    gulp.task('pragmatist:test', ['pragmatist:build'], function (done) {
        (0, _mergeStream2['default'])(gulp.src('./src/**/*.js').pipe((0, _gulpBabelIstanbul2['default'])({
            babelStage: 0
        })), gulp.src('./tests/**/*.js').pipe((0, _gulpBabel2['default'])())).pipe(_gulpBabelIstanbul2['default'].hookRequire()).on('finish', function () {
            gulp.src('./tests/**/*.js').pipe((0, _gulpMocha2['default'])()).on('error', function (error) {
                console.error('error', error);

                if (!watching) {
                    return;
                }

                this.emit('end');
            }).pipe(_gulpBabelIstanbul2['default'].writeReports()).on('end', function () {
                done();
            });
        });
    });

    gulp.task('pragmatist:watch', function () {
        watching = true;

        gulp.watch(['./src/**/*', './tests/**/*'], ['pragmatist:default']);
        // How to join multiple watch tasks?
        // gulp.watch(['./**/*.scss'], ['scss']);
    });

    gulp.task('pragmatist:default', ['pragmatist:test']);
};

module.exports = exports['default'];