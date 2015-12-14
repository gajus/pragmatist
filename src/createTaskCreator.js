import _ from 'lodash';
// import chalk from 'chalk';

/**
 * @param {Object} gulp
 * @param {Object} options
 * @returns {Function}
 */
export default (gulp, options = {}) => {
    if (!options.prefix) {
        options.prefix = '';
    }

    if (!options.preTask) {
        options.preTask = () => {
            return true;
        };
    }

    return (taskName, ...args) => {
        let dependencies,
            taskFn;

        dependencies = [];

        taskFn = () => {
            return false;
        };

        if (_.isArray(args[0])) {
            dependencies = args[0];

            if (_.isFunction(args[1])) {
                taskFn = args[1];
            }
        } else if (_.isFunction(args[0])) {
            taskFn = args[0];
        }

        dependencies = _.map(dependencies, (name) => {
            return options.prefix + name;
        });

        gulp.task(options.prefix + taskName, dependencies, (done) => {
            if (!options.preTask(options.prefix + taskName)) {
                done();

                return;
            }

            return taskFn(done);
        });
    };
};
