/**
 * Gulp plugins
 */

var gulp   = require('gulp'),
    browfy = require('gulp-browserify'),
    rename = require('gulp-rename');

/**
 * Sources paths
 */

var paths = [
    "basic",
    "auto-configuration"
];

/**
 * Compile scripts.
 **/

paths.forEach(function(path) {

    gulp.task(path, function() {
        return gulp.src(path + "/index.js")
            .pipe(browfy())
            .on("error", function(error) {
                process.stderr.write(error.stack);
                this.emit("end");
            })
            .pipe(rename('bundle.js'))
            .pipe(gulp.dest(path));
    });
});

gulp.task('build', paths);

gulp.task('watch', function() {

    gulp.watch(paths.map(function(path) {
        return path + "/index.js"
    }), paths);

});

gulp.task('default', ['build', 'watch']);
