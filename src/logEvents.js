/* eslint-disable */

import log from 'fancy-log';
import chalk from 'chalk';
import prettyHrtime from 'pretty-hrtime';

let formatError;

// Format orchestrator errors
formatError = (event) => {
    if (!event.err) {
        return event.message;
    }

    // PluginError
    if (typeof event.err.showStack === 'boolean') {
        return event.err.toString();
    }

    // Normal error
    if (event.err.stack) {
        return event.err.stack;
    }

    // Unknown (string, number, etc.)
    return new Error(String(event.err)).stack;
}

/**
 * @see https://github.com/gulpjs/gulp/blob/a54996c6a98acc000ebb310f89d7ca4bbacb9371/bin/gulp.js
 */
export default (gulpInst) => {
    gulpInst.on('task_start', (event) => {
        // TODO: batch these
        // so when 5 tasks start at once it only logs one time with all 5
        log('Starting', '\'' + chalk.cyan(event.task) + '\'...');
    });

    gulpInst.on('task_stop', (event) => {
        let time;

        time = prettyHrtime(event.hrDuration);

        log('Finished', '\'' + chalk.cyan(event.task) + '\'', 'after', chalk.magenta(time));
    });

    gulpInst.on('task_err', (event) => {
        let message,
            time;

        message = formatError(event);
        time = prettyHrtime(event.hrDuration);

        log(
            '\'' + chalk.cyan(event.task) + '\'',
            chalk.red('errored after'),
            chalk.magenta(time)
        );

        log(message);
    });
};
