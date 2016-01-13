import _ from 'lodash';
import del from 'del';
import babel from 'gulp-babel';
import Bluebird from 'bluebird';
import sourcemaps from 'gulp-sourcemaps';
import mocha from 'gulp-spawn-mocha';
import glob from 'globby';
import plumber from 'gulp-plumber';
import chalk from 'chalk';
import path from 'path';
import notifier from 'node-notifier';
import {
    lintFiles,
    getFormatter
} from 'canonical';
import gutil from 'gulp-util';
import prettyjson from 'prettyjson';
import chokidar from 'chokidar';
import runSequenceUnpaired from 'run-sequence';
import CssComb from 'csscomb';
// import stackTrace from 'stack-trace';
import logEvents from './logEvents';
import createTaskCraetor from './createTaskCreator';
import cssCombConfiguration from './csscomb.json';

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
        debounceSequence,
        plumberHandler,
        preWatch,
        runSequence,
        taskCreator,
        taskError,
        watching;

    runSequence = runSequenceUnpaired.use(gulp);

    /**
     * Debounces execution of 'task' and queues 'task' to run again
     * if an outside attempt to call 'task' was done before the
     * previous execution have ended.
     */
    debounceSequence = (task) => {
        let runTask,
            taskIsRunning;

        taskIsRunning = false;

        runTask = () => {
            // console.log('TASK REQUEST');

            if (taskIsRunning) {
                runTask();

                return;
            }

            taskIsRunning = true;

            // console.log('TASK START');

            task(() => {
                taskIsRunning = false;

                // console.log('TASK DONE');
            });
        };

        runTask = _.debounce(runTask, 100);

        return runTask;
    };

    watching = false;

    taskCreator = createTaskCraetor(gulp, {
        preTask: (taskName) => {
            if (taskError) {
                gutil.log(chalk.red('Skipping') + ' task ' + chalk.cyan(taskName) + ' due to an earlier error.');

                return false;
            }

            return true;
        },
        prefix: options.prefix
    });

    plumberHandler = () => {
        return plumber({
            errorHandler (error) {
                let errorPrint;

                taskError = true;

                errorPrint = error;

                if (error.message) {
                    // console.log('error', error.stack);

                    if (options.notifications) {
                        notifier.notify({
                            title: error.name,
                            message: error.message
                        });
                    }

                    errorPrint = {
                        message: error.message,
                        name: error.name,
                        plugin: error.plugin
                    };

                    /* stack: _.map(stackTrace.parse(error), (crumb) => {
                        return crumb.fileName + ':' + crumb.lineNumber + ':' + crumb.columnNumber;
                    }) */

                    /* eslint-disable no-underscore-dangle */
                    if (error._babel && error.codeFrame) {
                    /* eslint-enable no-underscore-dangle */
                        errorPrint.code = {
                            file: error.fileName + ':' + error.loc.line + ':' + error.loc.column,
                            frame: error.codeFrame
                        };

                        if (errorPrint.message.indexOf(error.fileName + ': ') === 0) {
                            errorPrint.message = errorPrint.message.substr(error.fileName.length + 2);
                        }
                    }
                }

                gutil.log('\n\n' + prettyjson.render(errorPrint) + '\n');

                if (watching) {
                    this.emit('end');
                }
            }
        });
    };

    config = _.assign({}, {
        forceLogging: false,
        prefix: 'pragmatist:'
    }, options);

    babelConfig = {
        babelrc: false,
        extends: path.resolve(__dirname, './babelrc.json'),
        plugins: [
            require.resolve('babel-plugin-lodash-modularize'),
            require.resolve('babel-plugin-add-module-exports')
        ],
        presets: [
            require.resolve('babel-preset-stage-0'),
            require.resolve('babel-preset-react')
        ]
    };

    if (config.types) {
        babelConfig.plugins.unshift(require.resolve('babel-plugin-typecheck'));
    }

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

            /* eslint-disable no-console */
            console.log(formatter(report));
            /* eslint-enable no-console */
        });
    });

    taskCreator('format-css', () => {
        let comb;

        comb = new CssComb(cssCombConfiguration);

        return Bluebird.resolve(glob([
            './src/**/*.css',
            './src/**/*.scss'
        ]))
            .map((path) => {
                return comb.processPath(path);
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
            .pipe(sourcemaps.init())
            .pipe(babel(babelConfig))
            .pipe(sourcemaps.write('.', {
                sourceRoot: process.cwd()
            }))
            .pipe(gulp.dest('./.test-build'));
    });

    taskCreator('test-hook-require', ['test-build'], () => {
        return gulp
            .src('./.test-build/src/**/*.js')
            .pipe(plumberHandler());
    });

    taskCreator('test-run', ['test-hook-require'], () => {
        return gulp
            .src(['./.test-build/tests/**/*.js'])
            .pipe(plumberHandler())
            .pipe(mocha({
                istanbul: true,
                /* eslint-disable id-length */
                r: require.resolve('source-map-support/register')
                /* eslint-enable id-length */
            }));
    });

    taskCreator('test-clean', ['test-run'], () => {
        return del('./.test-build');
    });

    taskCreator('test', ['test-clean'], (done) => {
        done();
    });

    preWatch = () => {
        watching = true;
        taskError = false;
    };

    taskCreator('watch', () => {
        chokidar
            .watch([
                './src/**/*',
                './tests/**/*'
            ])
            .on('all', debounceSequence((done) => {
                runSequence([
                    config.prefix + 'lint',
                    config.prefix + 'test',
                    config.prefix + 'build'
                ], done);
            }));
    });

    taskCreator('watch-lint', () => {
        chokidar
            .watch([
                './src/**/*',
                './tests/**/*'
            ])
            .on('all', debounceSequence((done) => {
                preWatch();

                runSequence([
                    config.prefix + 'lint'
                ], done);
            }));
    });

    taskCreator('watch-test', () => {
        chokidar
            .watch([
                './src/**/*',
                './tests/**/*'
            ])
            .on('all', debounceSequence((done) => {
                preWatch();

                runSequence([
                    config.prefix + 'test'
                ], done);
            }));
    });

    taskCreator('watch-build', () => {
        chokidar
            .watch([
                './src/**/*',
                './tests/**/*'
            ])
            .on('all', debounceSequence((done) => {
                preWatch();

                runSequence([
                    config.prefix + 'build'
                ], done);
            }));
    });
};
