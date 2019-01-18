//const { ipcMain } = require('electron');
var ipcRestModule = require(__dirname+'/ipcRestModule');

const backendApi = {
	cursorStatusPostTopic: "/cursor-status-changed"
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
		response.send({"msg": "whoaaaaaaa"});
	});
}

module.exports = {
	initializeBackend: initializeBackend
}