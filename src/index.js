import _ from 'lodash';
import {
    testTaskCreator,
    lintTaskCreator,
    buildTaskCreator,
    fixTaskCreator
} from './taskCreators';
import {
    watch,
    logEvents,
    createBabelConfig,
    createPlumberConfig,
    runSequence,
    patchGulpSrc
} from './utilities';


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
        plumberConfig;

    config = _.assign({}, {
        forceLogging: false,
        notifications: false,
        prefix: 'pragmatist:',
        typeAssertions: false
    }, options);

    babelConfig = createBabelConfig(config);
    plumberConfig = createPlumberConfig(config);

    gulp.src = patchGulpSrc(gulp, plumberConfig);

    if (config.forceLogging) {
        logEvents(gulp);
    }

    testTaskCreator(config, gulp, babelConfig);
    lintTaskCreator(config, gulp);
    buildTaskCreator(config, gulp, babelConfig);
    fixTaskCreator(config, gulp);

    gulp.task(config.prefix + 'watch', () => {
        watch([
            './src/**/*',
            './tests/**/*'
        ], () => {
            return runSequence(gulp, [
                config.prefix + 'lint',
                config.prefix + 'test',
                config.prefix + 'build'
            ]);
        });
    });

    gulp.task(config.prefix + 'watch-lint', () => {
        watch([
            './src/**/*',
            './tests/**/*'
        ], () => {
            return runSequence(gulp, [
                config.prefix + 'lint'
            ]);
        });
    });

    gulp.task(config.prefix + 'watch-test', () => {
        watch([
            './src/**/*',
            './tests/**/*'
        ], () => {
            return runSequence(gulp, [
                config.prefix + 'test'
            ]);
        });
    });

    gulp.task(config.prefix + 'watch-build', () => {
        watch([
            './src/**/*',
            './tests/**/*'
        ], () => {
            return runSequence(gulp, [
                config.prefix + 'build'
            ]);
        });
    });
};
