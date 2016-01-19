import plumber from 'gulp-plumber';

export default (gulp, plumberOptions = {}) => {
    let gulpSrc;

    gulpSrc = gulp.src;

    return (...args) => {
        return gulpSrc
            .apply(gulp, args)
            .pipe(plumber(plumberOptions));
    };
};
