import babel from 'gulp-babel';
import del from 'del';
import sourcemaps from 'gulp-sourcemaps';
import mocha from 'gulp-mocha';
import {
    runSequence
} from './../utilities';

export default (config, gulp, babelConfig) => {
    gulp.task(config.prefix + 'test:pre-copy-clean', () => {
        return del('./.test-build');
    });

    gulp.task(config.prefix + 'test:copy', () => {
        return gulp
            .src([
                './tests/**/*',
                './src/**/*'
            ], {
                base: './'
            })
            .pipe(gulp.dest('./.test-build'));
    });

    gulp.task(config.prefix + 'test:build', () => {
        return gulp
            .src('./.test-build/**/*.js')
            .pipe(sourcemaps.init())
            .pipe(babel(babelConfig))
            .pipe(sourcemaps.write('.', {
                sourceRoot: process.cwd()
            }))
            .pipe(gulp.dest('./.test-build'));
    });

    gulp.task(config.prefix + 'test:run', () => {
        return gulp
            .src(['./.test-build/tests/**/*.js'], {
                read: false
            })
            .pipe(mocha({
                require: [
                    require.resolve('source-map-support/register')
                ]
            }));
    });

    gulp.task(config.prefix + 'test:clean', () => {
        return del('./.test-build');
    });

    gulp.task(config.prefix + 'test', () => {
        return runSequence(gulp, [
            config.prefix + 'test:pre-copy-clean',
            config.prefix + 'test:copy',
            config.prefix + 'test:build',
            config.prefix + 'test:run',
            config.prefix + 'test:clean'
        ]);
    });
};
