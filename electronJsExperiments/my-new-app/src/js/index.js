//const { ipcRenderer } = require('electron')
/*
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
*/
  /*
  TODO
  +  Complete addLeafNode function using addCircle. Keep things simple. For now, there is no such thing as TextNode.
  Either solve mispositioning of a node or just create a circle as a leaf node for now.
  */

  // var visualizerModule = require("visualizerModule");

function mouseOverLeafNode(nodeId) {
var nodeCenter = visualizerModule.getNodeCenterById(nodeId);
var nodeRadius = visualizerModule.getNodeRadiusById(nodeId);

overlayerModule.drawTitleOverlay((nodeCenter.x+nodeRadius), (nodeCenter.y-nodeRadius), "Leaf ID: "+nodeId);
}

function mouseOutLeafNode(nodeId) {
overlayerModule.clearTitleOverlay();
}

function mouseOverRootNode(nodeId) {
var nodeCenter = visualizerModule.getNodeCenterById(nodeId);
var nodeRadius = visualizerModule.getNodeRadiusById(nodeId);

overlayerModule.drawTitleOverlay((nodeCenter.x+nodeRadius), (nodeCenter.y-nodeRadius), "Root ID: "+nodeId);
}

function mouseOutRootNode(nodeId) {
overlayerModule.clearTitleOverlay();
}

function initializeScript() {
const konvaDivID = "konva-div";
const overlayDivID = "overlay-div";
visualizerModule.initializeModule(konvaDivID);
overlayerModule.initializeModule(overlayDivID);

const rootNodeRadius = 30;
var rootNode = visualizerModule.createRootNode(rootNodeRadius, 500, 500, "root-0", mouseOverRootNode, mouseOutRootNode);

const leafNodeRadius = 15;
for(var i = 0; i < 40; i++) {
visualizerModule.createReferenceNode(rootNode, i, "ref-"+i.toString(), leafNodeRadius, mouseOverLeafNode, mouseOutLeafNode);
visualizerModule.createCitedByNode(rootNode, i, "cited-"+i, leafNodeRadius, mouseOverLeafNode, mouseOutLeafNode);
}

var nodeID = "ref-0";
var refNodeNo1 = visualizerModule.getNodeById(nodeID);
console.log(JSON.stringify(refNodeNo1));

var nodeCenter = visualizerModule.getNodeCenterById(nodeID);
console.log(JSON.stringify(nodeCenter));

}

document.addEventListener("DOMContentLoaded", function(event) {
console.log("DOM fully loaded and parsed");
initializeScript();
});