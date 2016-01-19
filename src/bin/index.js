#! /usr/bin/env node

import _ from 'lodash';
import Promise from 'bluebird';
import gulp from 'gulp';
import yargs from 'yargs';
import pragmatist from './..';

let argv,
    executeTaskNames,
    knownTaskNames;

argv = yargs
    .demand(1)
    .options({
        es5: {
            description: 'Uses es2015 Babel preset for the build.',
            type: 'boolean'
        },
        notifications: {
            description: 'Sends a notification to the OS if an error occurs.',
            type: 'boolean'
        },
        typeAssertions: {
            description: 'Inlines runtime type assertions for the type annotations.',
            type: 'boolean'
        }
    })
    .argv;

pragmatist(gulp, {
    es5: argv.es5,
    forceLogging: true,
    notifications: argv.notifications,
    prefix: 'pragmatist:',
    typeAssertions: argv.typeAssertions
});

knownTaskNames = _.keys(gulp.tasks);
executeTaskNames = argv._;

Promise
    .resolve(executeTaskNames)
    /* eslint-disable lodash3/prefer-lodash-method */
    .map((taskName) => {
    /* eslint-enable lodash3/prefer-lodash-method */
        let executeTaskName;

        executeTaskName = 'pragmatist:' + taskName;

        if (_.indexOf(knownTaskNames, executeTaskName) === -1) {
            throw new Error('"' + executeTaskName + '" task does not exist.');
        }

        return new Promise((resolve) => {
            gulp
                .start(executeTaskName)
                .on('task_stop', () => {
                    resolve();
                });
        });
    }, {
        concurrency: 1
    });
