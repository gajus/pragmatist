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
        watching;

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
        babelConfig.presets.push(require.resolve('babel-preset-es2015'));
        // https://phabricator.babeljs.io/T6719#68505
        babelConfig.plugins.push(require.resolve('babel-plugin-transform-class-properties'));
    }

    if (config.forceLogging) {
        logEvents(gulp);
    }

    watching = false;

    gulp.task(config.prefix + 'lint', () => {
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

    gulp.task(config.prefix + 'clean', () => {
        return del('./dist');
    });

    gulp.task(config.prefix + 'copy', [config.prefix + 'clean'], () => {
        return gulp
            .src('./src/**/*')
            .pipe(gulp.dest('./dist'));
    });

    gulp.task(config.prefix + 'build', [config.prefix + 'copy'], () => {
        if (!config.browser) {
            /* eslint-disable no-console */
            console.log('Making browser ' + chalk.red('incompatible build') + '. Build is configured to compile node v5+ ready code. ES2015 Babel preset can be added using "browser" option.');
            /* eslint-enable no-console */
        }

        return gulp
            .src('./src/**/*.js')
            .pipe(sourcemaps.init())
            .pipe(babel(babelConfig))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task(config.prefix + 'task-pre-copy-clean', () => {
        return del('./.test-build');
    });

    gulp.task(config.prefix + 'test-copy', [config.prefix + 'task-pre-copy-clean'], () => {
        return gulp
            .src(['./tests/**/*', './src/**/*'], {
                base: './'
            }).pipe(gulp.dest('./.test-build'));
    });

    gulp.task(config.prefix + 'test-build', [config.prefix + 'test-copy'], () => {
        return gulp
            .src('./.test-build/**/*.js')
            .pipe(babel(babelConfig))
            .pipe(gulp.dest('./.test-build'));
    });

    gulp.task(config.prefix + 'test-hook-require', [config.prefix + 'test-build'], () => {
        return gulp
            .src('./.test-build/src/**/*.js')
            .pipe(istanbul())
            .pipe(istanbul.hookRequire());
    });

    gulp.task(config.prefix + 'test-run', [config.prefix + 'test-hook-require'], () => {
        return gulp
            .src(['./.test-build/tests/**/*.js'])
            .pipe(plumber())
            .pipe(mocha())
            .pipe(istanbul.writeReports());
    });

    gulp.task(config.prefix + 'test-clean', [config.prefix + 'test-run'], () => {
        return del('./.test-build');
    });

    gulp.task(config.prefix + 'test', [config.prefix + 'test-clean']);

    gulp.task(config.prefix + 'watch', () => {
        watching = true;

        gulp.watch(['./src/**/*', './tests/**/*'], [config.prefix + 'lint', config.prefix + 'test', config.prefix + 'build']);
    });

    gulp.task(config.prefix + 'watch-lint', () => {
        watching = true;

        gulp.watch(['./src/**/*', './tests/**/*'], [config.prefix + 'lint']);
    });

    gulp.task(config.prefix + 'watch-test', () => {
        watching = true;

        gulp.watch(['./src/**/*', './tests/**/*'], [config.prefix + 'test']);
    });

    gulp.task(config.prefix + 'watch-build', () => {
        watching = true;

        gulp.watch(['./src/**/*', './tests/**/*'], [config.prefix + 'build']);
    });
};
