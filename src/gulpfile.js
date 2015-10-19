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
 * @returns {undefined}
 */
export default (gulp) => {
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

    gulp.task('pragmatist:clean', ['pragmatist:lint'], () => {
        return del('./dist');
    });

    gulp.task('pragmatist:copy', ['pragmatist:clean'], () => {
        return gulp
            .src('./src/**/*')
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('pragmatist:build', ['pragmatist:copy'], () => {
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

    gulp.task('pragmatist:test', ['pragmatist:build'], (done) => {
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

    gulp.task('pragmatist:watch', () => {
        watching = true;

        gulp.watch(['./src/**/*', './tests/**/*'], ['pragmatist:default']);
        // How to join multiple watch tasks?
        // gulp.watch(['./**/*.scss'], ['scss']);
    });

    gulp.task('pragmatist:default', ['pragmatist:test']);
};
