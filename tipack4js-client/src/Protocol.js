var tipack = tipack || {};

tipack.Protocol = tipack.Protocol || function(params) { return (function(params) {
	params = params || {};
	var userAgent = params.userAgent || "tipack4js (gzip)"; // required to enable AppEngine gzip compression on Titanium

	var self = {};
	
	self.post = function(params) {
		var url = params.url || null;
		var obj = params.obj || null;
		var callback = params.callback || function(e){};
		var timeout = params.timeout || 60000;
		
		var client = http.create({
			onload : function(e) {
				callback(JSON.parse(client.responseText));
			},
			onerror : function(e) {
				callback({
					error : {
						code : "protocol",
						message : "protocol error"
					}
				});
			},
			timeout : timeout
		});
	
		client.open("POST", url);
		client.setUserAgent(userAgent);
		client.setRequestHeader("Content-Type", "application/json");
		client.setRequestHeader("Accept", "application/json");
		
		client.send(JSON.stringify(obj));
	};

	return self;
}(params))};
