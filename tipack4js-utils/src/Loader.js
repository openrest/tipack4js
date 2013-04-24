var tipack = tipack || {};

tipack.Loader = tipack.Loader || (function() {
	var self = {};
	
	function load(params) {
		var projectId = params.projectId;
		var useLatest = params.useLatest;
        var callback = params.callback;
        
		var project = tipack.Properties.getProject(projectId);
		var shouldDownload = true;
		if ((!useLatest) && (project !== null) && (typeof(project.archiveId) !== "undefined")) {
			var archiveFile = tipack.Filesystem.getArchiveFile(project.archiveId);
			if (archiveFile.exists()) {
				shouldDownload = false;
			}
		}
		
		if (shouldDownload) {
            callback({type:"download_start"});
                                  
			tipack.Utils.downloadProject({
				projectId : projectId,
                progressCallback: function(progress) {
                    callback({type:"download_progress", "progress":progress});
                },
				callback : function(response) {
                    callback({type:"download_end"});
                    
					if (response.error) { // Internet connection problem?
						callback({
							type : "error",
							error : response.error
						});
					} else {
						load({
							projectId : projectId,
							useLatest : false,
                            callback : callback
						});
					}
				}
			});
			return;
		}

        callback({type:"extract_start"});
        tipack.Utils.extractArchive(project.archiveId);
        callback({type:"extract_end"});

		var app = new tipack.App({
			project : project,
            callback: callback
		});
		app.addEventListener("close", function(e) {
			if (e.reason === "restart") {
				self.loadDefault({
					callback : callback
				});
			} else if (e.reason === "exit") {
				if (Ti.Platform.getOsname() === "android") {
					Ti.Android.currentActivity.finish();
				}
			}
		});
		app.addEventListener("safe", function(e) {
			tipack.Properties.setNumFailedRuns(0);
		});
		
		// "I am prepared for the worst, but hope the best." - Benjamin Disraeli
		tipack.Properties.setNumFailedRuns(tipack.Properties.getNumFailedRuns() + 1);
		app.run();        
	}
	
	/**
	 * Performs the following logic:
	 * 1. Get the default project and its default archiveId.
	 * 2. If the default archiveId is unknown or not available locally,
	 *    query the remote tipack-service and download the archive.
	 * 3. Extract the archive and run the extracted app.
	 * 4. Wait for the app to close, goto 1 unless closed due to shutdown.
	 */
	self.loadDefault = function(params) {
		var defaultProjectId = params.defaultProjectId;
		var defaultUseLatest = params.defaultUseLatest || false;
		var defaultNumFailedRuns = params.defaultNumFailedRuns || 0;
		var defaultMaxFailedRuns = params.defaultMaxFailedRuns || 3;
        var callback = params.callback || function(e){};
        
        // Initialize directory structure and properties
		tipack.Filesystem.createDirectoryStructure();
		var projectId = tipack.Properties.getProjectId();
		if (projectId === null) {
			projectId = defaultProjectId;
			tipack.Properties.setProjectId(projectId);
		}
		var useLatest = tipack.Properties.getUseLatest();
		if (useLatest === null) {
			useLatest = defaultUseLatest;
			tipack.Properties.setUseLatest(useLatest);
		}
		var numFailedRuns = tipack.Properties.getNumFailedRuns();
		if (numFailedRuns === null) {
			numFailedRuns = defaultNumFailedRuns;
			tipack.Properties.setNumFailedRuns(numFailedRuns);
		}
		var maxFailedRuns = tipack.Properties.getMaxFailedRuns();
		if (maxFailedRuns === null) {
			maxFailedRuns = defaultMaxFailedRuns;
			tipack.Properties.setMaxFailedRuns(maxFailedRuns);
		}
		
		if (numFailedRuns >= maxFailedRuns) {
			useLatest = true;
		}
		
		load({
			projectId : projectId,
			useLatest : useLatest,
			callback : callback
		});
	};
	
	return self;
}());
