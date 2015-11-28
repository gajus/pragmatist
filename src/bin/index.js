import P from 'bluebird';
import gulp from 'gulp';
import pragmatist from './..';
import {
    argv
} from 'yargs';

let knownTaskNames,
    executeTaskNames;

pragmatist(gulp, 'pragmatist:', true);

knownTaskNames = Object.keys(gulp.tasks);
executeTaskNames = argv._;

if (executeTaskNames.length === 0) {
    executeTaskNames.push('test');
}

P
    .resolve(executeTaskNames)
    .map((taskName) => {
        let executeTaskName;

        executeTaskName = 'pragmatist:' + taskName;

        if (knownTaskNames.indexOf(executeTaskName) === -1) {
            throw new Error('"pragmatist:' + executeTaskName + '" task does not exist.');
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
