
module.exports = function (ctx) {
    
    const Q = ctx.requireCordovaModule('q'),
		path = ctx.requireCordovaModule('path'),
		fs = ctx.requireCordovaModule('fs');
    android_dir = path.resolve(__dirname, '../platforms/android');
    gradle_file = path.resolve(__dirname, '../build-extras.gradle');
    dest_gradle_file = android_dir + '/app/build-extras.gradle';

    if (fs.existsSync(android_dir) && fs.existsSync(gradle_file)) {
        console.log('Copy ' + gradle_file + ' to ' + android_dir);
        fs.createReadStream(gradle_file).pipe(fs.createWriteStream(dest_gradle_file));
    } else {
        console.log(gradle_file + ' not found. Skipping');
    }
}