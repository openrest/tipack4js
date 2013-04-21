var tipack = tipack || {};

tipack.Service = tipack.Service || (function() {
	var self = new tipack.Hub();

	var client = new tipack.Client();
	var timeout;
	var errorTimeout;
    var handle = null;

	function toVersionObject(versionStr) {
		if (typeof(versionStr) === "undefined") {
			versionStr = "";
		}
		var arr = versionStr.split(".");
		
		var major = parseInt(arr[0]);
		var minor = parseInt(arr[1]);
		var build = parseInt(arr[2]);
		
		return {
			major : (isNaN(major) ? 0 : major),
			minor : (isNaN(minor) ? 0 : minor),
			build : (isNaN(build) ? 0 : build)
		};
	}
	
	function getUpdateType(currentVersionStr, latestVersionStr) {
		var currentVersion = toVersionObject(currentVersionStr);
		var latestVersion = toVersionObject(latestVersionStr);
		
		if (currentVersion.major > latestVersion.major) {
			return "future";
		} else if (currentVersion.major < latestVersion.major){
			return "major";
		}
		
		if (currentVersion.minor > latestVersion.minor) {
			return "future";
		} else if (currentVersion.minor < latestVersion.minor){
			return "minor";
		}
		
		if (currentVersion.build > latestVersion.build) {
			return "future";
		} else if (currentVersion.build < latestVersion.build){
			return "build";
		}
		
		return "latest";
	}
	
	function checkForUpdates(params) {
		var callback = params.callback;
        var progressCallback = params.progressCallback;
		
		var projectId = tipack.Properties.getProjectId();
		var project = tipack.Properties.getProject(projectId);
		
		client.request({
			request : {
				type : "get_project",
				projectId : projectId
			},
			callback : function(response) {
				if (response.error) {
					callback(response);
					return;
				}
				
				var latestProject = response.value;
				
				var updateType = getUpdateType(project.version, latestProject.version);
				if ((updateType !== "major") && (updateType !== "minor")) {
					callback({
						value : {
							type : updateType
						}
					});
					return;
				}

                self.fireEvent("downloadStart", {});
				
				tipack.Utils.downloadProject({
					projectId : projectId,
                    progressCallback: progressCallback,
					callback : function(result) {
						if (result.error) {
							callback(result);
							return;
						}
						callback({
							value : {
								type : updateType
							}
						});
					}
				});
			}
		});
	}

	function checkForUpdatesRecurring() {
        handle = null;

		checkForUpdates({
            progressCallback: function(progress) {
                self.fireEvent("progress", progress);
            },
			callback : function(result) {
				var nextTimeout;
				if (result.error) {
					nextTimeout = errorTimeout;
				} else {
					nextTimeout = timeout;
					tipack.Instance.markSafeRun();
				}
				self.fireEvent("update", result);
				handle = setTimeout(checkForUpdatesRecurring, timeout);
			}
		});
	}

    self.checkUpdateNow = function() {
		// Already checking, or not yet started
 		if (handle === null) {
        	return;
        }

        clearTimeout(handle);
		checkForUpdatesRecurring();
    };

	self.start = function(params) {
		params = params || {};
		timeout = params.timeout || (1000 * 60 * 60);
		errorTimeout = params.errorTimeout || (1000 * 60 * 5);
		
		checkForUpdatesRecurring();
	};
	
	return self;
}());
