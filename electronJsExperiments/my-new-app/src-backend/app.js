//const { ipcMain } = require('electron');
var ipcRestModule = require(__dirname+'/ipcRestModule');
var crossrefModule = require(__dirname+'/crossrefModule');

const backendApi = {
	getCrossrefMetaDataByDoi: "/get-crossref-metadata-by-doi"
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
}

module.exports = {
	initializeBackend: initializeBackend
}