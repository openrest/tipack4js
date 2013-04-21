var tipack = tipack || {};

tipack.Client = tipack.Client || function(params) { return (function(params) {
	params = params || {};
	var apiUrl = params.apiUrl || "https://tipack.openrest.com/v1.0";
	
	var self = {};
	
	var protocol = new tipack.Protocol();
	
	self.request = function(params) {
		params = params || {};
		var request = params.request || null;
		var callback = params.callback || function(response){};
		
		protocol.post({
			url : apiUrl,
			obj : request,
			callback : callback
		});
	};
	
	self.getProject = function(params) {
		var projectId = params.projectId;
		var callback = params.callback;
		
		tipack.Protocol.get({
			url : apiUrl + "/projects/" + projectId,
			callback : callback
		});
	};
	
	self.getArchiveUrl = function(archiveId) {
		return apiUrl + "/archives/" + archiveId;
	};
	
	return self;
}(params))};
