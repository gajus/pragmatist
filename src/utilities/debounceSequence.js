import _ from 'lodash';

/**
 * Debounces execution of 'task' and queues 'task' to run again
 * if an outside attempt to call 'task' was done before the
 * previous execution have ended.
 */

export default (task) => {
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
