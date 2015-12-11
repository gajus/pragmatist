import _ from 'lodash';
import del from 'del';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import mocha from 'gulp-mocha';
import glob from 'globby';
import istanbul from 'gulp-istanbul';
import plumber from 'gulp-plumber';
import chalk from 'chalk';
import {
    lintFiles,
    getFormatter
} from 'canonical';

import logEvents from './logEvents';
import gutil from 'gulp-util';
import prettyjson from 'prettyjson';
// import stackTrace from 'stack-trace';

import createTaskCraetor from './createTaskCreator';

/**
 * @typedef {Object} options
 * @property {string} prefix Used to prefix all pragmatist tasks.
 * @property {boolean} forceLogging Forces gulp logs for task start time and completion time.
 */

/**
 * @param {Object} gulp
 * @param {options} options
 * @returns {undefined}
 */
export default (gulp, options = {}) => {
    let babelConfig,
        config,
        plumberHandler,
        taskCreator,
        taskError;

    taskCreator = createTaskCraetor(gulp, {
        prefix: options.prefix,
        preTask: (taskName) => {
            if (taskError) {
                gutil.log('Skipping task ' + chalk.cyan(taskName) + ' due to an error.');

                return false;
            }

            return true;
        }
    });

    plumberHandler = () => {
        return plumber({
            errorHandler: function (error) {
                let errorPrint;

                taskError = true;

                errorPrint = error;

                if (error.message) {
                    errorPrint = {
                        name: error.name,
                        message: error.message,
                        plugin: error.plugin
                    };

                    /* stack: _.map(stackTrace.parse(error), (crumb) => {
                        return crumb.fileName + ':' + crumb.lineNumber + ':' + crumb.columnNumber;
                    }) */

                    /* eslint-disable no-underscore-dangle */
                    if (error._babel) {
                    /* eslint-enable no-underscore-dangle */
                        errorPrint.code = {
                            file: error.fileName + ':' + error.loc.line + ':' + error.loc.column,
                            frame: error.codeFrame
                        };
                    }
                }

                gutil.log('\n\n' + prettyjson.render(errorPrint) + '\n');

                this.emit('end');
            }
        });
    };

    config = _.assign({}, {
        prefix: 'pragmatist:',
        forceLogging: false
    }, options);

    babelConfig = {
        presets: [
            require.resolve('babel-preset-stage-0'),
            require.resolve('babel-preset-react')
        ],
        plugins: [
            require.resolve('babel-plugin-lodash')
        ]
    };

    if (config.browser) {
        babelConfig.presets.unshift(require.resolve('babel-preset-es2015'));
        // https://phabricator.babeljs.io/T6719#68505
        // babelConfig.plugins.unshift(require.resolve('babel-plugin-transform-class-properties'));
    } else {
        babelConfig.plugins.push(require.resolve('babel-plugin-transform-es2015-modules-commonjs'));
        babelConfig.plugins.push(require.resolve('babel-plugin-transform-es2015-parameters'));
    }

    if (config.forceLogging) {
        logEvents(gulp);
    }

    taskCreator('lint', () => {
        return glob([
            './src/**/*.js',
            './tests/**/*.js',
            './src/**/*.css',
            './src/**/*.scss'
        ])
        .then((paths) => {
            let formatter,
                report;

            formatter = getFormatter();
            report = lintFiles(paths);

            if (report.errorCount || report.warningCount) {
                /* eslint-disable no-console */
                console.log(formatter(report));
                /* eslint-enable no-console */
            }
        });
    });

    taskCreator('clean', () => {
        return del('./dist');
    });

    taskCreator('copy', ['clean'], () => {
        return gulp
            .src('./src/**/*')
            .pipe(gulp.dest('./dist'));
    });

    taskCreator('build', ['copy'], () => {
        if (!config.browser) {
            /* eslint-disable no-console */
            console.log('Making browser ' + chalk.red('incompatible build') + '. Build is configured to compile node v5+ ready code. ES2015 Babel preset can be added using "browser" option.');
            /* eslint-enable no-console */
        }

        return gulp
            .src('./src/**/*.js')
            .pipe(plumberHandler())
            .pipe(sourcemaps.init())
            .pipe(babel(babelConfig))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./dist'));
    });

    taskCreator('task-pre-copy-clean', () => {
        return del('./.test-build');
    });

    taskCreator('test-copy', ['task-pre-copy-clean'], () => {
        return gulp
            .src(['./tests/**/*', './src/**/*'], {
                base: './'
            }).pipe(gulp.dest('./.test-build'));
    });

    taskCreator('test-build', ['test-copy'], () => {
        return gulp
            .src('./.test-build/**/*.js')
            .pipe(plumberHandler())
            .pipe(babel(babelConfig))
            .pipe(gulp.dest('./.test-build'));
    });

    taskCreator('test-hook-require', ['test-build'], () => {
        return gulp
            .src('./.test-build/src/**/*.js')
            .pipe(plumberHandler())
            .pipe(istanbul())
            .pipe(istanbul.hookRequire());
    });

    taskCreator('test-run', ['test-hook-require'], () => {
        return gulp
            .src(['./.test-build/tests/**/*.js'])
            .pipe(plumberHandler())
            .pipe(mocha())
            .pipe(istanbul.writeReports());
    });

    taskCreator('test-clean', ['test-run'], () => {
        return del('./.test-build');
    });

    taskCreator('test', ['test-clean']);

    gulp.task(config.prefix + 'pre-watch', () => {
        taskError = false;
    });

    taskCreator('watch', () => {
        gulp.watch(['./src/**/*', './tests/**/*'], [config.prefix + 'pre-watch', config.prefix + 'lint', config.prefix + 'test', config.prefix + 'build']);
    });

    taskCreator('watch-lint', () => {
        gulp.watch(['./src/**/*', './tests/**/*'], [config.prefix + 'pre-watch', config.prefix + 'lint']);
    });

    taskCreator('watch-test', () => {
        gulp.watch(['./src/**/*', './tests/**/*'], [config.prefix + 'pre-watch', config.prefix + 'test']);
    });

    taskCreator('watch-build', () => {
        gulp.watch(['./src/**/*', './tests/**/*'], [config.prefix + 'pre-watch', config.prefix + 'build']);
    });
};
