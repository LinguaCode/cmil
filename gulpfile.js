var gulp = require('gulp');
var eslint = require('gulp-eslint');

gulp
  .task('lint', function () {
    return gulp
      .src('./src/**')
      .pipe(eslint('.eslintrc.js'))
      .pipe(eslint.format())
      .pipe(eslint.results(function (results) {
        // Called once for all ESLint results.
        console.log('Total Results: ' + results.length);
        console.log('Total Warnings: ' + results.warningCount);
        console.log('Total Errors: ' + results.errorCount);
      }));
  })

  .task('eslint-watch', function () {
    gulp.watch("./scr/**", ['lint']);
  })

  .task('default', ['lint', 'eslint-watch']);
