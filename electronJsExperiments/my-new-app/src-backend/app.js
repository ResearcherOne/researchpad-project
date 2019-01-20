//const { ipcMain } = require('electron');
var ipcRestModule = require(__dirname+'/ipcRestModule');
//var crossrefModule = require(__dirname+'/crossrefModule');

const backendApi = {
	cursorStatusPostTopic: "/cursor-status-changed",
	getCrossrefMetaDataByDoi: "/get-crossref-metadata-by-doi"
};

const listenRenderer = "listen-renderer";
const responseRenderer = "response-to-renderer";

function initializeBackend() {
	console.log("Backend initialized.");

	ipcRestModule.initialize(listenRenderer, responseRenderer);

	ipcRestModule.listen(backendApi.cursorStatusPostTopic, function(request, response){
		console.log("Main process received an object: ");
		console.log(JSON.stringify(request));

		console.log("Cursor Pos: x "+request.x+" y "+request.y);

		//console.log(JSON.stringify(response));
		const receivedX = parseInt(request.x);
		console.log("RECEIVED X: "+receivedX);
		if(receivedX<100) {
			console.log("whoaaa");
			response.send({"msg": "whoaaaaaaa"});
		} else {
			console.log("HMMMMMM");
			response.error("Ooops, x is bigger than 100");
		}
	});

	ipcRestModule.listen(backendApi.getCrossrefMetaDataByDoi, function(request, response){
		console.log("Main process received an object: ");
		console.log(JSON.stringify(request));
		const doi = request.doi;
		/*
		crossrefModule.fetchReferenceMetadataByDoi(doi, function(err, res) {
			if(!err) {
				response.send({"references": res});
			} else {

			}
		});
		*/
		console.log("Cursor Pos: x "+request.x+" y "+request.y);

		//console.log(JSON.stringify(response));
		response.send({"msg": "whoaaaaaaa"});
	});
}

module.exports = {
	initializeBackend: initializeBackend
}