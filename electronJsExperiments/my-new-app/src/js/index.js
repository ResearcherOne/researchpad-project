//const { ipcRenderer } = require('electron')

const backendApi = {
	cursorStatusPostTopic: "/cursor-status-changed"
};

const sendRequestsTopic = "listen-renderer";
const listenResponsesTopic = "response-to-renderer";

ipcRestRenderer.initialize(sendRequestsTopic, listenResponsesTopic);

function getRootNodeInfo(doi, callback) {
	var doiJson = {"doi": doi};
	//ipcRenderer.send(backendApi.getRootNodeInfoPostTopic, JSON.stringify(doiJson));
}

function showCoords(event) {
	var x = event.clientX;
	var y = event.clientY;
	var coords = "( X coords: " + x + ", Y coords: " + y+ " )";
	document.getElementById("demo").innerHTML = coords;
	var mousePos = {"x": x, "y": y};

	ipcRestRenderer.request(backendApi.cursorStatusPostTopic, mousePos, function(err, responseObj){
		console.log("Response received!!!");
		if(!err) {
			console.log(JSON.stringify(responseObj));
		} else {
			console.log("Error occured: "+err.msg);
		}
	});
}