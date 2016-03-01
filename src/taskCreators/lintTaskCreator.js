import glob from 'globby';
import {
    lintFiles,
    getFormatter
} from 'canonical';

export default (config, gulp) => {
    gulp.task(config.prefix + 'lint', () => {
        return glob([
            './src/**/*.js',
            './tests/**/*.js',
            './src/**/*.css',
            './src/**/*.scss'
        ])
            .then((paths) => {
                const formatter = getFormatter();
                const report = lintFiles(paths);

                /* eslint-disable no-console */
                console.log(formatter(report));
                /* eslint-enable no-console */
            });
    });
};
