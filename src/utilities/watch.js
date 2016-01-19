import chokidar from 'chokidar';
import debounceSequence from './debounceSequence';

export default (paths, task) => {
    chokidar
        .watch(paths)
        .on('all', debounceSequence((done) => {
            task().then(done);
        }));
};
