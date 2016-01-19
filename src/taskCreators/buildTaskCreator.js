import babel from 'gulp-babel';
import del from 'del';
import sourcemaps from 'gulp-sourcemaps';
import chalk from 'chalk';
import {
    runSequence
} from './../utilities';

export default (config, gulp, babelConfig) => {
    gulp.task(config.prefix + 'build:clean', () => {
        return del('./dist');
    });

    gulp.task(config.prefix + 'build:copy', () => {
        return gulp
            .src('./src/**/*')
            .pipe(gulp.dest('./dist'));
    });

    gulp.task(config.prefix + 'build:compile', () => {
        if (!config.es5) {
            /* eslint-disable no-console */
            console.log('Making ' + chalk.red('ES5 incompatible build') + '. Use "es5" option to compile code down to ES5.');
            /* eslint-enable no-console */
        }

        return gulp
            .src('./src/**/*.js')
            .pipe(sourcemaps.init())
            .pipe(babel(babelConfig))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task(config.prefix + 'build', () => {
        return runSequence(gulp, [
            config.prefix + 'build:clean',
            config.prefix + 'build:copy',
            config.prefix + 'build:compile'
        ]);
    });
};
