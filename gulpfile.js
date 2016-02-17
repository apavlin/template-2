var gulp = require("gulp"),
	concat = require('gulp-concat'),
    browserSync = require('browser-sync'),
    jade = require('gulp-jade'),
    plumber = require('gulp-plumber'),
    uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    spritesmith = require('gulp.spritesmith'),
	rename = require("gulp-rename"),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
    sourcemaps = require('gulp-sourcemaps');

//Paths
var paths = {
	jade: {
        location: [
            'dev/jade/_pages/*.jade'
        ],
        destination: 'prod'
    },
	
    scss: {
        location: [
            'bower_components/normalize-scss/_normalize.scss',
            'dev/scss/**/*.scss'
        ],
        destination: 'prod/css'
    },

    js: {
        location: [
            'bower_components/jquery/dist/jquery.js',
            'dev/js/*.js'
        ],
        destination: 'prod/js'
    }
};


//Jade 
gulp.task('jade-compile', function() {
  var YOUR_LOCALS = {};
  gulp.src(paths.jade.location)
        .pipe(plumber())
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(paths.jade.destination))
});

//SASS
gulp.task('sass-compile', function() {
	gulp.src(paths.scss.location)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(sass({outputStyle: 'compressed'}))
		.pipe(autoprefixer(['> 5%', 'last 5 versions', 'IE 9']))
		.pipe(concat("main.min.css"))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.scss.destination));
	});

// concat js
gulp.task('concat-js', function() {
  return gulp.src(paths.js.location)
  	.pipe(sourcemaps.init())
  	.pipe(concat('main.min.js'))
    .pipe(uglify())
  	.pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.js.destination));
});

// auto sprites
gulp.task('sprite', function() {
    var spriteData = gulp.src('dev/img/icons/*.png')
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.scss',
            algorithm: 'top-down',
            padding:  5
        }));
    spriteData.img.pipe(gulp.dest('prod/img/'));
    spriteData.css.pipe(gulp.dest('dev/scss/'));
});

// images minification 
gulp.task('img-min', function() {
    return gulp.src('dev/img/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('prod/img'));
});

// Сервер
gulp.task('server', function () {
  browserSync({
    port: 9000,
    server: {
      baseDir: 'prod'
    }
  });
});

// Слежка
gulp.task('watch', function () {
  gulp.watch('dev/jade/**/*', ['jade-compile']);
  gulp.watch(paths.scss.location, ['sass-compile']);
  gulp.watch('dev/img/**/*', ['img-min']);
  gulp.watch('dev/js/**/*', ['concat-js']);
  gulp.watch([
    paths.jade.destination,
    paths.js.destination,
    paths.scss.destination
  ]).on('change', browserSync.reload);
});

// Задача по-умолчанию
gulp.task('default', [
  'jade-compile', 
  'sass-compile', 
  'concat-js', 
  'server', 
  'watch'
]);
