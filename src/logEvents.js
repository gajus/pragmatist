import gutil from 'gulp-util';
import chalk from 'chalk';
import prettyHrtime from 'pretty-hrtime';

let formatError;

// Format orchestrator errors
formatError = (e) => {
    if (!e.err) {
        return e.message;
    }

    // PluginError
    if (typeof e.err.showStack === 'boolean') {
        return e.err.toString();
    }

    // Normal error
    if (e.err.stack) {
        return e.err.stack;
    }

    // Unknown (string, number, etc.)
    return new Error(String(e.err)).stack;
}

/**
 * @see https://github.com/gulpjs/gulp/blob/a54996c6a98acc000ebb310f89d7ca4bbacb9371/bin/gulp.js
 */
export default (gulpInst) => {
    // Total hack due to poor error management in orchestrator
    gulpInst.on('err', () => {
        failed = true;
    });

    gulpInst.on('task_start', (e) => {
        // TODO: batch these
        // so when 5 tasks start at once it only logs one time with all 5
        gutil.log('Starting', '\'' + chalk.cyan(e.task) + '\'...');
    });

    gulpInst.on('task_stop', (e) => {
        let time;

        time = prettyHrtime(e.hrDuration);

        gutil.log('Finished', '\'' + chalk.cyan(e.task) + '\'', 'after', chalk.magenta(time));
    });

    gulpInst.on('task_err', (e) => {
        let msg,
            time;

        msg = formatError(e);
        time = prettyHrtime(e.hrDuration);

        gutil.log(
            '\'' + chalk.cyan(e.task) + '\'',
            chalk.red('errored after'),
            chalk.magenta(time)
        );

        gutil.log(msg);
    });
}
