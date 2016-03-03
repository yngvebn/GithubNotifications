var gulp	 	= require('gulp'),	
	uglify		= require('gulp-uglify'),
	zip           = require('gulp-zip'),
	concat		= require('gulp-concat');

var paths = {
	appJavascript: ['app/**/*.module.js', 'app/**/*.js'],
	jsDest: 'js',
	vendorScript:  ["node_modules/lodash/lodash.min.js", "node_modules/angular/angular.min.js", "node_modules/angular-animate/angular-animate.min.js","node_modules/moment/min/moment-with-locales.min.js"],
	html: ['index.html', 'options.html', 'background.html']
}


gulp.task('watch', function(){
	gulp.watch(paths.appJavascript, ['vendor', 'scripts']);
})

gulp.task('vendor', function(){
	return gulp.src(paths.vendorScript)
			.pipe(concat('vendor.js'))
			.pipe(gulp.dest(paths.jsDest));
})

gulp.task('build', ['vendor', 'scripts:uglify']);

gulp.task('scripts', function(){
	return gulp.src(paths.appJavascript)
			.pipe(concat('app.js'))
			.pipe(gulp.dest(paths.jsDest));
});


gulp.task('scripts:uglify', function(){
	return gulp.src(paths.appJavascript)
			.pipe(concat('app.js'))
			.pipe(uglify())
			.pipe(gulp.dest(paths.jsDest));
});


gulp.task('dist', ['build'], function(){
	gulp.src('js/**').pipe(gulp.dest('dist/js'));
	gulp.src('css/**').pipe(gulp.dest('dist/css'));
	gulp.src('assets/**').pipe(gulp.dest('dist/assets'));
	gulp.src('manifest.json').pipe(gulp.dest('dist'));
	gulp.src(paths.html).pipe(gulp.dest('dist/'));

});


//build ditributable and sourcemaps after other tasks completed
gulp.task('zip', ['dist'], function() {
  var manifest = require('./manifest.json'),
    distFileName = manifest.name + ' v' + manifest.version + '.zip';
  //collect all source maps
  
  return gulp.src('dist/**')
    .pipe(zip(distFileName))
    .pipe(gulp.dest('package'));
});
 
//run all tasks after build directory has been cleaned
gulp.task('chrome', ['clean'], function() {
    gulp.start('zip');
});