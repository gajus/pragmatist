'create index';

import createBabelConfig from './createBabelConfig.js';
import createPlumberConfig from './createPlumberConfig.js';
import debounceSequence from './debounceSequence.js';
import logEvents from './logEvents.js';
import patchGulpSrc from './patchGulpSrc.js';
import runSequence from './runSequence.js';
import watch from './watch.js';

export {
    createBabelConfig,
    createPlumberConfig,
    debounceSequence,
    logEvents,
    patchGulpSrc,
    runSequence,
    watch
};

