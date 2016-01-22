import glob from 'globby';
import {
    fixFiles
} from 'canonical';

export default (config, gulp) => {
    gulp.task(config.prefix + 'fix', () => {
        return glob([
            './src/**/*.js',
            './tests/**/*.js',
            './src/**/*.css',
            './src/**/*.scss'
        ])
            .then((paths) => {
                let report;

                report = fixFiles(paths);

                /* eslint-disable no-console */
                console.log(report);
                /* eslint-enable no-console */
            });
    });
};
