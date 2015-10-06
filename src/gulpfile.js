import del from 'del';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import mocha from 'gulp-mocha';
import istanbul from 'gulp-babel-istanbul';
import merge from 'merge-stream';

/**
 * @param {Object} gulp
 */
export default (gulp) => {
    gulp.task('pragmatist:test', (done) => {
        merge(
            gulp
                .src('./src/**/*.js')
                .pipe(istanbul()),
            gulp
                .src('./tests/**/*.js')
                .pipe(babel())
        )
            .pipe(istanbul.hookRequire())
            .on('finish', () => {
                gulp
                    .src('./tests/**/*.js')
                    .pipe(mocha())
                    .pipe(istanbul.writeReports())
                    .on('end', done);
            });
    });

    gulp.task('pragmatist:clean', () => {
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
            .pipe(babel())
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('pragmatist:watch', () => {
        gulp.watch(['./src/**/*', './tests/**/*'], ['default']);
        // How to join multiple watch tasks?
        // gulp.watch(['./**/*.scss'], ['scss']);
    });

    gulp.task('pragmatist:default', ['pragmatist:build']);
};