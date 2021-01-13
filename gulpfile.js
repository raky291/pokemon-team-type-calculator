const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const del = require('del');
const merge = require('merge-stream');
const through = require('through2');
const sassOptions = require('./.sassrc.js');

// ----------------------------------------------
// Options
// ----------------------------------------------

const options = {
    clean: {
        dir: 'assets/dist/**',
    },
    styles: {
        src: 'assets/src/scss/*.scss',
        watch: 'assets/src/scss/**/*.scss',
        sass: sassOptions,
        dest: 'assets/dist/css',
    },
    scripts: [
        {
            src: ['node_modules/bootstrap/dist/js/bootstrap.bundle.js', 'assets/src/js/*.js'],
            babel: true,
            concat: 'main.js',
            dest: 'assets/dist/js',
        },
    ],
};

// ----------------------------------------------
// Helpers
// ----------------------------------------------

function $if(condition, callback) {
    return condition ? callback() : through.obj();
}

// ----------------------------------------------
// Clean
// ----------------------------------------------

const clean = () => del(options.clean.dir);

// ----------------------------------------------
// Debug
// ----------------------------------------------

function debugStyles() {
    return gulp
        .src(options.styles.src, { sourcemaps: true })
        .pipe(sass(options.styles.sass))
        .pipe(postcss())
        .pipe(gulp.dest(options.styles.dest, { sourcemaps: true }));
}

function debugScripts() {
    return merge(
        options.scripts.map((script) => {
            return gulp
                .src(script.src, { sourcemaps: true })
                .pipe($if(script.babel, () => babel()))
                .pipe($if(script.concat, () => concat(script.concat)))
                .pipe(gulp.dest(script.dest, { sourcemaps: true }));
        })
    );
}

const debug = gulp.series(clean, gulp.parallel(debugStyles, debugScripts));

// ----------------------------------------------
// Release
// ----------------------------------------------

function releaseStyles() {
    return gulp
        .src(options.styles.src)
        .pipe(sass(options.styles.sass))
        .pipe(postcss())
        .pipe(gulp.dest(options.styles.dest));
}

function releaseScripts() {
    return merge(
        options.scripts.map((script) => {
            return gulp
                .src(script.src)
                .pipe($if(script.babel, () => babel()))
                .pipe($if(script.concat, () => concat(script.concat)))
                .pipe(uglify())
                .pipe(gulp.dest(script.dest));
        })
    );
}

const release = gulp.series(clean, gulp.parallel(releaseStyles, releaseScripts));

// ----------------------------------------------
// Watch
// ----------------------------------------------

function debugWatch() {
    gulp.watch(options.styles.watch, debugStyles);
    options.scripts.forEach((script) => gulp.watch(script.src, debugScripts));
}

function releaseWatch() {
    gulp.watch(options.styles.watch, releaseStyles);
    options.scripts.forEach((script) => gulp.watch(script.src, releaseScripts));
}

// ----------------------------------------------
// Tasks
// ----------------------------------------------

exports.debug = debug;
exports.release = release;
exports.debugWatch = debugWatch;
exports.releaseWatch = releaseWatch;
exports.watch = releaseWatch;
exports.default = release;
