var tipack = tipack || {};

tipack.Filesystem = tipack.Filesystem || (function() {
	var baseDir = "tipack";
	var archivesDir = "archives";
	var appsDir = "apps";
	
	var self = {};
	
	function getPrivateDocumentsDirectory() {
		var file = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDataDirectory());
		var fileStr = file.nativePath;
		// Fix for iOS Simulator leaving out the trailing slash
		if (fileStr.charAt(fileStr.length - 1) !== "/") {
			fileStr += "/";
		}
		var privateDir = fileStr.replace("Documents/","");	
		privateDir += "Library/Private%20Documents/";
		return privateDir;
	}
	
	function getRootDirectory() {
		return ((Ti.Platform.getOsname() === "android")
			? Ti.Filesystem.getApplicationDataDirectory()
			: getPrivateDocumentsDirectory());
	}
	
	self.getArchivesDir = function() {
		return Ti.Filesystem.getFile(getRootDirectory(),
			baseDir, archivesDir);
	};

	self.getArchiveFile = function(archiveId) {
		return Ti.Filesystem.getFile(getRootDirectory(),
			baseDir, archivesDir, archiveId + ".json");
	};
	
	self.getAppsDir = function() {
		return Ti.Filesystem.getFile(getRootDirectory(),
			baseDir, appsDir);
	};
	
	self.getAppDir = function(archiveId) {
		return Ti.Filesystem.getFile(getRootDirectory(),
			baseDir, appsDir, archiveId);
	};
	
	self.getAppFlagFile = function(archiveId) {
		return Ti.Filesystem.getFile(getRootDirectory(),
			baseDir, appsDir, archiveId + ".flag");
	};
	
	self.createDirectoryStructure = function() {
		var dir = Ti.Filesystem.getFile(getRootDirectory());
		dir.createDirectory();
		
		dir = Ti.Filesystem.getFile(getRootDirectory(), baseDir);
		dir.createDirectory();
		if (dir.setRemoteBackup) {
			dir.setRemoteBackup(false);
		}

		dir = Ti.Filesystem.getFile(getRootDirectory(), baseDir, archivesDir);
		dir.createDirectory();
		
		dir = Ti.Filesystem.getFile(getRootDirectory(), baseDir, appsDir);
		dir.createDirectory();
	};
	
	/**
	 * Titanium 2.x on iOS doesn't implement Ti.Filesystem.File.isDirectory.
	 * @see http://developer.appcelerator.com/question/136433/titaniumfilesystemfileisdirectory-on-ios
	 */
	function isDirectory(file) {
		if (file.isDirectory) {
			return file.isDirectory();
		}
		
		if (!file.exists()) {
        	return false;
        }
        
        var nativePath = file.nativePath;
        return (nativePath[nativePath.length - 1] === Ti.Filesystem.getSeparator());
	}	
	
	function deleteFile(file) {
		if (isDirectory(file)) {
			file.deleteDirectory(true); // recursive
		} else {
			file.deleteFile();
		}
	}
	
	function deleteAll(basePath, excludeFilenames) {
		excludeFilenames = excludeFilenames || [];
		
		var list = basePath.getDirectoryListing();
		if (list) {
			for (var i = 0, l = list.length; i < l; ++i) {
				var filename = list[i];
				var exclude = false;
				for (var j = 0, m = excludeFilenames.length; j < m; ++j) {
					if (filename === excludeFilenames[j]) {
						exclude = true;
						break;
					}
				}
				if (!exclude) {
					var file = Ti.Filesystem.getFile(basePath.nativePath, filename);
					deleteFile(file);
				}
			}
		}
	}
	
	self.cleanup = function(params) {
		params = params || {};
		var excludeArchiveId = params.excludeArchiveId || null;
		
		// Delete archives
		var excludeArchiveFilename = ((excludeArchiveId !== null) ? (excludeArchiveId + ".json") : null);
		deleteAll(self.getArchivesDir(), [excludeArchiveFilename]);
		
		// Delete extracted apps (and flag files)
		var excludeFlagFilename = ((excludeArchiveId !== null) ? (excludeArchiveId + ".flag") : null);
		var excludeAppFilename = ((excludeArchiveId !== null) ? (excludeArchiveId) : null);
		deleteAll(self.getAppsDir(), [excludeFlagFilename, excludeAppFilename]);
	};
	
	return self;
}());