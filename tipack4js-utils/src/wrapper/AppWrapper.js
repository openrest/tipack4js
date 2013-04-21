var tipack = tipack || {};

tipack.Instance = tipack.Instance || (function() {
	var self = {};

	var appParams = Ti.UI.currentWindow.params || {};
	
	self.close = function(params) {
		var reason = params.reason;
		
		Ti.UI.currentWindow.fireEvent("exit", {
			reason : reason
		});
	};

    self.getProgress = function() {
        return appParams.progress;
    };
	
	self.markSafeRun = function() {
		Ti.UI.currentWindow.fireEvent("safe", {});
	};
	
	function relative(filename) {
		var path;
		if (typeof(appParams.baseDir) === "undefined") {
			path = filename;
		} else {
			path = appParams.baseDir + filename;
		}
		return Ti.Filesystem.getFile(path).nativePath;
	}
	
	self.relative = relative;
	
	self.include = function(filename) {
		Ti.include(relative(filename));
	};
	
	self.getProject = function() {
		if ((appParams === null) || (typeof(appParams.project) === "undefined")) {
			return null;
		}
		return JSON.parse(JSON.stringify(appParams.project)); // clone the object
	};
	
	return self;
}());

// syntactic sugar
var relative = tipack.Instance.relative;
var include = tipack.Instance.include;

// WORKAROUND: in iOS, a TabGroup opened from the wrapped app.js did not receive UI events.
// @see http://developer.appcelerator.com/question/123449/window-events-open-and-focus-are-inconsistent-on-tabgroups-main-window-in-ios
setTimeout(function() {
	include("/app.js");
}, 1);
