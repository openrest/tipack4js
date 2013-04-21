var tipack = tipack || {};

tipack.Downloader = tipack.Downloader || (function() {
	var self = {};
	
	self.download = function(params) {
		var url = params.url; // String
		var file = params.file; // Ti.Filesystem.File
		var timeout = params.timeout || 60000;
		var callback = params.callback || function(e) {};
        var progressCallback = params.progressCallback || function(e) {};

		var client = Ti.Network.createHTTPClient({
            ondatastream: function(e) {
                progressCallback(e.progress);
            },
			onload : function(e) {
				var data = this.responseText;
				if (data !== null) {
					if (file.write(data)) {
						callback({
							params : params
						});
					} else {
						callback({
							params : params,
							error : {
								code : "io",
								message : "could not write file"
							}
						});
					}
				} else {
					callback({
						params : params,
						error : {
							code : "io",
							message : "invalid file format (not text)"
						}
					});
				}
			},
			onerror : function(e) {
				callback({
					params : params,
					error : {
						code : "io",
						message : "could not download file"
					}
				});
			},
			timeout : timeout
		});

		// If the server uses chunked encoding (as Google AppEngine does), it
		// never sends the "Content-Length" header and the client cannot send
		// progress updates.
		// As a workaround, we ask for partial content (but really, for the
		// entire file). This causes the server to answer with the "Content-Range"
		// header which includes the file size. Unfortunately, Titanium's HTTPClient
		// implementation ignores the "Content-Range" header, so we had to change
		// its native implementation to support this.
		client.open("GET", url);
        client.setRequestHeader("User-Agent", tipack.getDefaultUserAgent());
        client.setRequestHeader("Range", "bytes=0-");
		client.send();
	};
	
	return self;
}());
