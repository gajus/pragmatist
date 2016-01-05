import _ from 'lodash';
import P from 'bluebird';
import gulp from 'gulp';
import yargs from 'yargs';
import pragmatist from './..';

let argv,
    executeTaskNames,
    knownTaskNames;

argv = yargs
    .demand(1)
    .options({
        browser: {
            description: 'Uses es2015 Babel preset for the build.',
            type: 'boolean'
        },
        notifications: {
            description: 'Sends a notification to the OS if an error occurs.',
            type: 'boolean'
        },
        types: {
            description: 'Writes type assertions using the flow type annotations.',
            type: 'boolean'
        }
    })
    .argv;

pragmatist(gulp, {
    browser: argv.browser,
    forceLogging: true,
    notifications: argv.notifications,
    prefix: 'pragmatist:',
    types: argv.types
});

knownTaskNames = _.keys(gulp.tasks);
executeTaskNames = argv._;

P
    .resolve(executeTaskNames)
    /* eslint-disable lodash3/prefer-lodash-method */
    .map((taskName) => {
    /* eslint-enable lodash3/prefer-lodash-method */
        let executeTaskName;

        executeTaskName = 'pragmatist:' + taskName;

        if (_.indexOf(knownTaskNames, executeTaskName) === -1) {
            throw new Error('"' + executeTaskName + '" task does not exist.');
        }

        return new P((resolve) => {
            gulp
                .start(executeTaskName)
                .on('task_stop', () => {
                    resolve();
                });
        });
    }, {
        concurrency: 1
    });
