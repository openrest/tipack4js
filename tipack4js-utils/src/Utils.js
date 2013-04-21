var tipack = tipack || {};

tipack.Utils = tipack.Utils || (function() {
	var self = {};
	
	var client = new tipack.Client();
	
    self.getDefaultIosImageParams = function()
    {
        if (Ti.Platform.displayCaps.platformWidth === 320)
        {
            if (Ti.Platform.displayCaps.platformHeight == 480)
            {
                return {image:"Default.png", top:-20, left:0, right:0, bottom:0};
            }
            else
            {
                return {image:"Default-568h.png", top:-20, left:0, right:0, bottom:0};
            }
        }
    
        return {image:"Default-Portrait.png", top:0, left:0, right:0, bottom:0};
    };

	self.downloadProject = function(params) {
		var projectId = params.projectId;
		var callback = params.callback;
        var progressCallback = params.progressCallback;
		
		client.request({
			request : {
				type : "get_project",
				projectId : projectId
			},
			callback : function(response) {
				if (response.error) {
					callback({
						error : response.error
					});
					return;
				}
				
				var project = response.value || null;
				var archive = project.archive || null;
				if (!archive) {
					callback({
						error : {
							code : "not_found",
							message : "no archive defined for project " + projectId
						}
					});
					return;
				}
				
				tipack.Properties.setProject(projectId, project);
				var archiveFile = tipack.Filesystem.getArchiveFile(archive.id);
				if (archiveFile.exists()) {
					callback({});
					return;
				}

				tipack.Downloader.download({
					url : archive.url,
					file : archiveFile,
					timeout : 1000 * 60 * 10,
                    progressCallback : progressCallback,
					callback : function(result) {
						if (result.error) {
							callback({
								error : result.error
							});
						} else {
							callback({});
						}
					}
				});
			}
		});
	};
	
	function writeFile(appDir, archiveFile) {
		var file = Ti.Filesystem.getFile(appDir.resolve(), archiveFile.path);
			
		if (typeof(archiveFile.data) === "undefined") {
			if (!file.createDirectory()) {
				throw new Error("Could not create directory: " + file.resolve());
			}
		} else {
			var contents;
			var encoding = archiveFile.encoding;
			if ((typeof(encoding) === "undefined") || (encoding === "text")) {
				contents = archiveFile.data;
			} else if (encoding === "base64") {
				contents = Ti.Utils.base64decode(archiveFile.data)
			} else {
				throw new Error("Unknown encoding: " + encoding);
			}
			file.write(contents); // return value is screwed on the iPhone
			if (!file.exists()) {
				throw new Error("Could not write file: " + file.resolve());
			}
		}
	}
	
	function writeFiles(appDir, files) {
		for (var i = 0, l = files.length; i < l; ++i) {
			writeFile(appDir, files[i]);
		}
	}
	
	function readArchive(archiveId) {
		var archiveFile = tipack.Filesystem.getArchiveFile(archiveId);
		if (!archiveFile.exists()) {
			throw new Error("Archive file does not exist: " + archiveId);
		}
		
		var archiveData = archiveFile.read();
		var json = archiveData.text;
		return JSON.parse(json);
	}
	
	self.extractArchive = function(archiveId) {
		// Already extracted?
		var appFlagFile = tipack.Filesystem.getAppFlagFile(archiveId);
		if (!appFlagFile.exists()) {
			// Create directory structure
			tipack.Filesystem.createDirectoryStructure();
			var appDir = tipack.Filesystem.getAppDir(archiveId);
			if (appDir.exists()) {
				if (!appDir.deleteDirectory(true)) {
					throw new Error("Could not delete apps directory");
				}
			}
			if (!appDir.createDirectory()) {
				throw new Error("Could not create app directory: " + archiveId);
			}
			
			// Extract app
			try {
				var archive = readArchive(archiveId);
				writeFiles(appDir, archive.files);
			} catch (e) {
				// Make best effort to cleanup on error
				appDir.deleteDirectory(true);
				throw e;
			}
			
			appFlagFile.write("");
		}
	};
	
	return self;
}());
