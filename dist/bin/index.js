'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _ = require('./..');

var _2 = _interopRequireDefault(_);

var _yargs = require('yargs');

var knownTaskNames = undefined,
    executeTaskNames = undefined;

(0, _2['default'])(_gulp2['default']);

knownTaskNames = Object.keys(_gulp2['default'].tasks);
executeTaskNames = _yargs.argv._;

if (executeTaskNames.length === 0) {
    executeTaskNames.push('test');
}

_bluebird2['default'].resolve(executeTaskNames).map(function (taskName) {
    var executeTaskName = undefined;

    executeTaskName = 'pragmatist:' + taskName;

    if (knownTaskNames.indexOf(executeTaskName) === -1) {
        throw new Error('"pragmatist:' + executeTaskName + '" task does not exist.');
    }

    return new _bluebird2['default'](function (resolve) {
        _gulp2['default'].start(executeTaskName).on('task_stop', function () {
            resolve();
        });
    });
}, {
    concurrency: 1
});