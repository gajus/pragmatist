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
    gulp.task('test', (done) => {
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

    gulp.task('clean', () => {
        return del('./dist');    
    });

    gulp.task('copy', ['clean'], () => {
        return gulp
            .src('./src/**/*')
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('build', ['copy'], () => {
        return gulp
            .src('./src/**/*.js')
            .pipe(sourcemaps.init())
            .pipe(babel())
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('default', ['build']);
};