var os = require("os");

var ipcRestModule = require(__dirname+'/ipcRestModule');
var crossrefModule = require(__dirname+'/crossrefModule');

const backendApi = {
	getCrossrefMetaDataByDoi: "/get-crossref-metadata-by-doi",
	getHostname: "/get-hostname"
};

const listenRenderer = "listen-renderer";
const responseRenderer = "response-to-renderer";

function initializeBackend() {
	console.log("Backend initialized.");

	ipcRestModule.initialize(listenRenderer, responseRenderer);

	ipcRestModule.listen(backendApi.getCrossrefMetaDataByDoi, function(request, response){
		const doi = request.doi;

		crossrefModule.fetchMetadataByDoi(doi, function(err, res) {
			if(!err) {
				response.send({"metadata": res});
			} else {
				response.error("OOps, unable to fetch metadata from crossref.");
			}
		});
	});

	ipcRestModule.listen(backendApi.getHostname, function(request, response){
		const computerName = os.hostname();
		
		response.send({"hostname": computerName});
	});
}

module.exports = {
	initializeBackend: initializeBackend
}