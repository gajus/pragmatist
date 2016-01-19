import Promise from 'bluebird';
import runSequenceUnpaired from 'run-sequence';

export default (gulp, tasks) => {
    let runSequence;

    runSequence = runSequenceUnpaired.use(gulp);

    return new Promise((resolve, reject) => {
        let doneCallback;

        doneCallback = (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        };

        runSequence.apply(null, tasks.concat(doneCallback));
    });
};
