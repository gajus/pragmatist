import del from 'del';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import mocha from 'gulp-mocha';
import istanbul from 'gulp-babel-istanbul';
import merge from 'merge-stream';
import glob from 'globby';

import canonical, {
    lintFiles,
    getFormatter
} from 'canonical';

/**
 * @param {Object} gulp
 * @param {string} prefix Used to prefix all pragmatist tasks.
 * @returns {undefined}
 */
export default (gulp, prefix = 'pragmatist:') => {
    let watching;

    watching = false;

    gulp.task('pragmatist:lint', () => {
        return glob([
                './src/**/*.js',
                './tests/**/*.js'
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
            .pipe(babel({
                stage: 0,
                plugins: [
                    require.resolve('babel-plugin-lodash')
                ]
            }))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task(prefix + 'test', (done) => {
        merge(
            gulp
                .src('./src/**/*.js')
                .pipe(istanbul({
                    babelStage: 0
                })),
            gulp
                .src('./tests/**/*.js')
                .pipe(babel())
        )
            .pipe(istanbul.hookRequire())
            .on('finish', () => {
                gulp
                    .src('./tests/**/*.js')
                    .pipe(mocha())
                    .on('error', function (error) {
                        console.error('error', error);

                        if (!watching) {
                            return;
                        }

                        this.emit('end');
                    })
                    .pipe(istanbul.writeReports())
                    .on('end', () => {
                        done();
                    });
            });
    });

    gulp.task(prefix + 'watch', () => {
        watching = true;

        gulp.watch(['./src/**/*', './tests/**/*'], [prefix + 'lint', prefix + 'test']);
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
