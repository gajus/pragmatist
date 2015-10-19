'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _gulpfile = require('./../gulpfile');

var _gulpfile2 = _interopRequireDefault(_gulpfile);

var _yargs = require('yargs');

var taskNames = undefined,
    executeTaskNames = undefined,
    executeTaskName = undefined;

(0, _gulpfile2['default'])(_gulp2['default']);

taskNames = Object.keys(_gulp2['default'].tasks);
executeTaskNames = _yargs.argv._;

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

_gulp2['default'].start(executeTaskName);
//# sourceMappingURL=index.js.map
