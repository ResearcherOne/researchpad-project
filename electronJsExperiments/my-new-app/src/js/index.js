//const { ipcRenderer } = require('electron')

const backendApi = {
	cursorStatusPostTopic: "/cursor-status-changed",
	getCrossrefMetaDataByDoi: "/get-crossref-metadata-by-doi"
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

	/*
	ipcRestRenderer.request(backendApi.cursorStatusPostTopic, mousePos, function(err, responseObj){
		if(!err) {
			//console.log(JSON.stringify(responseObj));
		} else {
			console.log("Error occured: "+err.msg);
		}
	});
	*/
	
	const requestObj = {"doi": "10.1103/physrevlett.98.010505"};
	ipcRestRenderer.request(backendApi.getCrossrefMetaDataByDoi, requestObj, function(err, responseObj){
		if(!err) {
			console.log("References are fetched from backend.");
			console.log(JSON.stringify(responseObj));
			//console.log(JSON.stringify(responseObj));
		} else {
			console.log("Error occured: "+err.msg);
		}
	});
}