var tipack = tipack || {};

tipack.App = tipack.App || function(params) { return (function(params) {
	var project = params.project;
    var callback = params.callback || function(e) {};
	
	var self = {};
	
	var hub = new tipack.Hub();
	var running = false;

	self.run = function() {
		if (!running) {
            var params = {
                project : project,
                baseDir : tipack.Filesystem.getAppDir(project.archiveId).resolve()
            };
            callback({"type":"app_setup", "params":params});
            
			// Race condition here. The JavaScript code inside the Window starts
			// running immediately upon creation (and not on "open"), but expects
			// its 'params' field to be already set.
            var win = Ti.UI.createWindow({
                url : "/tipack/AppWrapper.js"
            });
            win.params = params;
            
            // On iOS, loading the splash screen image to the App window must compensate
            // for the top bar.
            if (Ti.Platform.getOsname() !== "android") {

	            win.add(Ti.UI.createImageView(tipack.Utils.getDefaultIosImageParams()));
            }
            
            callback({"type":"app_run", "win":win});
			running = true;
			
			// Another race condition here. Theoretically, events could be fired
			// before we register the event handlers.
			win.addEventListener("exit", function(e) {
                callback({"type":"app_close", "win":win});
				running = false;
				win.close();
				self.fireEvent("close", {
					reason : (e.reason ? e.reason : "unknown")
				});
			});
			win.addEventListener("safe", function(e) {
				self.fireEvent("safe", e);
			});

			// This seems to just "activate" the window in the UI. The window's
			// Javascript code is already running.
			win.open();
		}
	};
	
	self.addEventListener = function(name, callback) {
		hub.addEventListener(name, callback);
	};
	
	self.removeEventListener = function(name, callback) {
		hub.removeEventListener(name, callback);
	};
	
	self.fireEvent = function(name, event) {
		hub.fireEvent(name, event);
	};
	
	self.isRunning = function() {
		return running;
	};
	
	return self;
}(params))};
