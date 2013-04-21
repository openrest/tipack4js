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
	
	return self;
}());