import gulp from 'gulp';
import gulpfile from './../gulpfile';
import {
    argv
} from 'yargs';

let taskNames,
    executeTaskNames,
    executeTaskName;

gulpfile(gulp);

taskNames = Object.keys(gulp.tasks);
executeTaskNames = argv._;

if (executeTaskNames.length === 0) {
    executeTaskNames.push('default');
}

if (executeTaskNames.length > 1) {
    throw new Error('Cannot execute more than one task at once.');
}

executeTaskName = 'pragmatist:' + executeTaskNames[0];

if (taskNames.indexOf(executeTaskName) === -1) {
    throw new Error('"pragmatist:' + executeTaskName + '" task does not exist.');
}

gulp.start(executeTaskName);
