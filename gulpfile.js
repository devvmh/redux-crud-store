const babel = require('gulp-babel')
const del = require('del')
const gulp = require('gulp')
const rename = require('gulp-rename')
const sourcemaps = require('gulp-sourcemaps')

gulp.task('default', ['commonjs', 'es'])

gulp.task('commonjs', transpile.bind(null, gulp.dest('src'), babel({
  presets: ['react', 'es2015'],
  plugins: ['transform-object-rest-spread']
})))

gulp.task('es', transpile.bind(null, gulp.dest('es'), babel({
  presets: ['react'],
  plugins: ['transform-object-rest-spread']
})))

function transpile(dest, babelConfig) {
  return gulp.src('src/**/*.js.flow')
    .pipe(sourcemaps.init())
    .pipe(babelConfig)
    .pipe(rename({
      extname: ''  // prevents adding second '.js' etxension
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest)
}

gulp.task('clean', () => {
  return del([
    'dist/**/*',
    'es/**/*',
    'lib/**/*',
    'src/**/*.js',
    'src/**/*.js.map'
  ])
})
