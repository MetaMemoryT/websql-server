var gulp = require('gulp');
var rimraf = require('gulp-rimraf');

gulp.task('clean', function() {
  return gulp.src('./data/*', {
      read: false
    })
    .pipe(rimraf());
});