cordova.define("cordova-fix-blackscreen.cordova-fix-blackscreen", function(require, exports, module) {
var exec = require('cordova/exec');

exports.coolMethod = function(arg0, success, error) {
    exec(success, error, "cordova-fix-blackscreen", "coolMethod", [arg0]);
};

});
