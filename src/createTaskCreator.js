import chalk from 'chalk';
import moment from 'moment';

/**
 * @param {Object} gulp
 * @returns {Function}
 */
export default (gulp) => {
    return (taskName, ...args) => {
        let dependencies,
            taskFn;

        dependencies = [];
        taskFn = () => {};

        if (typeof args[0] === 'object') {
            dependencies = args[0];

            if (typeof args[1] === 'function') {
                taskFn = args[1];
            }
        } else if (typeof args[0] === 'function') {
            taskFn = args[1];
        }

        gulp.task(taskName, dependencies, (done) => {
            let taskResult,
                logStarting,
                logFinished,
                startTime,
                endTime;

            logStarting = () => {
                startTime = moment();

                console.log('[' + chalk.gray(startTime.format('HH:mm:ss')) + '] Starting \'' + chalk.cyan(taskName) + '\'...');
            };

            logFinished = () => {
                let elapsedTime;

                endTime = moment();

                elapsedTime = endTime.diff(startTime) + ' μs';

                console.log('[' + chalk.gray(endTime.format('HH:mm:ss')) + '] Finished \'' + chalk.cyan(taskName) + '\' after ' + chalk.magenta(elapsedTime));
            };

            logStarting();


            taskResult = taskFn(() => {
                logFinished();

                done();
            });

            if (taskResult && typeof taskResult.then === 'function') {
                taskResult
                    .then((result) => {
                        logFinished();

                        return result;
                    });
            }
        })
    };
};
