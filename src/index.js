import del from 'del';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import mocha from 'gulp-mocha';
import glob from 'globby';
import istanbul from 'gulp-istanbul';

import canonical, {
    lintFiles,
    getFormatter
} from 'canonical';

let babelConfig;

babelConfig = {
    presets: [
        require.resolve('babel-preset-es2015'),
        require.resolve('babel-preset-stage-0'),
        require.resolve('babel-preset-react')
    ],
    plugins: [
        require.resolve('babel-plugin-lodash')
    ]
};

/**
 * @param {Object} gulp
 * @param {string} prefix Used to prefix all pragmatist tasks.
 * @returns {undefined}
 */
export default (gulp, prefix = 'pragmatist:') => {
    let watching;

    watching = false;

    gulp.task(prefix + 'lint', () => {
        return glob([
                './src/**/*.js',
                './tests/**/*.js',
                './src/**/*.css',
                './src/**/*.scss'
            ])
            .then((paths) => {
                let formatter,
                    report;

                formatter = getFormatter();
                report = lintFiles(paths);

                if (report.errorCount || report.warningCount) {
                    console.log(formatter(report));
                }
            });
    });

    gulp.task(prefix + 'clean', () => {
        return del('./dist');
    });

    gulp.task(prefix + 'copy', [prefix + 'clean'], () => {
        return gulp
            .src('./src/**/*')
            .pipe(gulp.dest('./dist'));
    });

    gulp.task(prefix + 'build', [prefix + 'copy'], () => {
        return gulp
            .src('./src/**/*.js')
            .pipe(sourcemaps.init())
            .pipe(babel(babelConfig))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task(prefix + 'test-build', () => {
        return gulp
            .src(['./tests/**/*.js', './src/**/*.js'], {
                base: './'
            })
            .pipe(babel(babelConfig))
            .pipe(gulp.dest('./.test-build'));
    });

    gulp.task(prefix + 'test-hook-require', [prefix + 'test-build'], () => {
        return gulp.src('./.test-build/src/**/*.js')
            .pipe(istanbul())
            .pipe(istanbul.hookRequire());
    });

    gulp.task(prefix + 'test-run', [prefix + 'test-hook-require'], () => {
        return gulp.src(['./.test-build/tests/**/*.js'])
            .pipe(mocha())
            .pipe(istanbul.writeReports());
    });

    gulp.task(prefix + 'test-clean', [prefix + 'test-run'], () => {
        return del('./.test-build');
    });

    gulp.task(prefix + 'test', [prefix + 'test-clean']);

    gulp.task(prefix + 'watch', () => {
        watching = true;

        gulp.watch(['./src/**/*', './tests/**/*'], [prefix + 'lint', prefix + 'test', prefix + 'build']);
    });

    gulp.task(prefix + 'watch-lint', () => {
        watching = true;

        gulp.watch(['./src/**/*', './tests/**/*'], [prefix + 'lint']);
    });

    gulp.task(prefix + 'watch-test', () => {
        watching = true;

        gulp.watch(['./src/**/*', './tests/**/*'], [prefix + 'test']);
    });
};
