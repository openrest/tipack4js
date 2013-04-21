var tipack = tipack || {};

/**
 * Standard properties:
 * 
 * "project"             -> current projectId (string)
 * "projects/{project}"  -> latest known project (Project)
 * "numFailedRuns"       -> Number of failed run, for safety logic (int)
 * "maxFailedRuns"       -> Maximum number of failed run, for safety logic (int)
 * "useLatest"           -> Force always using latest project version (boolean)
 * 
 * Properties are unique per native app ID/version, to simplify native app updates.
 */
tipack.Properties = tipack.Properties || (function() {
	var self = {};
	
	function getPropertiesKey() {
		return "tipack|" + Ti.App.id + "|" + Ti.App.version;
	}
	
	function loadProperties() {
		var key = getPropertiesKey();
		if (Ti.App.Properties.hasProperty(key)) {
			var json = Ti.App.Properties.getString(key);
			var properties = JSON.parse(json);
			if (properties) {
				return properties;
			}
		}
		return {};
	}
	
	function saveProperties(properties) {
		var json = JSON.stringify(properties);
		Ti.App.Properties.setString(getPropertiesKey(), json);
	}
	
	function get(property) {
		var value = loadProperties()[property];
		return ((typeof(value) !== "undefined") ? value : null);
	}
	
	function set(property, value) {
		var properties = loadProperties();
		properties[property] = value;
		saveProperties(properties);
	}
	
	self.getNumFailedRuns = function() {
		return get("numFailedRuns");
	};
	
	self.setNumFailedRuns = function(numFailedRuns) {
		set("numFailedRuns", numFailedRuns);
	};
	
	self.getMaxFailedRuns = function() {
		return get("maxFailedRuns");
	};
	
	self.setMaxFailedRuns = function(maxFailedRuns) {
		set("maxFailedRuns", maxFailedRuns);
	};
	
	self.getProjectId = function() {
		return get("project");
	};
	
	self.setProjectId = function(projectId) {
		set("project", projectId);
	};
	
	self.getProject = function(projectId) {
		return get("projects/" + projectId);
	};
	
	self.setProject = function(projectId, project) {
		set("projects/" + projectId, project);
	};

	self.getUseLatest = function() {
		return get("useLatest");
	};
	
	self.setUseLatest = function(useLatest) {
		set("useLatest", useLatest);
	};
	
	return self;
}());