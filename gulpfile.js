const gulp = require('gulp')
const del = require('del')
const babel = require('gulp-babel')
const rename = require('gulp-rename')
const ts = require('gulp-typescript')
const tsconfig = require('./tsconfig.json')

gulp.task('build_clean', () => {
  return del(['dist', 'types'])
})

gulp.task('build_tsc', () => {
  return gulp.src('src/**/*.ts')
    .pipe(ts({ ...tsconfig.compilerOptions, declaration: true }))
    .pipe(gulp.dest('dist/types'))
})

gulp.task('build_js', gulp.series('build_clean', () => {
  return gulp.src('src/**/*.ts')
    .pipe(ts(tsconfig.compilerOptions))
    .pipe(rename({
      basename: 'index',
      extname: '.mjs'
    }))
    .pipe(gulp.dest('dist'))
    .pipe(babel({
      presets: ['@babel/env'],
      plugins: [['@babel/plugin-transform-modules-commonjs']]
    }))
    .pipe(rename({
      basename: 'index',
      extname: '.cjs'
    }))
    .pipe(gulp.dest('dist'))
    .pipe(babel({
      presets: ['@babel/env'],
      plugins: [['@babel/transform-modules-umd']]
    }))
    .pipe(rename({
      basename: 'index',
      extname: '.js'
    }))
    .pipe(gulp.dest('dist'))
}))

gulp.task('build_all', gulp.series('build_js', 'build_tsc', () => {
  return gulp.src('dist/types/**/*.d.ts')
    .pipe(gulp.dest('types'))
}))

gulp.task('build_lazy', gulp.series('build_all', () => {
  return del('dist/types')
}))
