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

function getMetadataWithDoi(doi, callback) {
	const requestObj = {"doi": doi}; //doi = "10.1103/physrevlett.98.010505"
	ipcRestRenderer.request(backendApi.getCrossrefMetaDataByDoi, requestObj, function(err, responseObj){
		if(!err) {
			var metadata = responseObj.metadata;

			console.log("Metadatafetched from backend.");
			//console.log(JSON.stringify(metadata));
			callback(null, metadata);
		} else {
			console.log("Error occured: "+err.msg);
			callback(err, null);
		}
	});
}

const backendApi = {
	cursorStatusPostTopic: "/cursor-status-changed",
	getCrossrefMetaDataByDoi: "/get-crossref-metadata-by-doi"
};

const sendRequestsTopic = "listen-renderer";
const listenResponsesTopic = "response-to-renderer";

const konvaDivID = "konva-div";
const overlayDivID = "overlay-div";

function initializeScript() {
	ipcRestRenderer.initialize(sendRequestsTopic, listenResponsesTopic);
	visualizerModule.initializeModule(konvaDivID);
	overlayerModule.initializeModule(overlayDivID);



	/*
	for(var i = 0; i < 40; i++) {
		visualizerModule.createReferenceNode(rootNode, i, "ref-"+i.toString(), leafNodeRadius, mouseOverLeafNode, mouseOutLeafNode);
		visualizerModule.createCitedByNode(rootNode, i, "cited-"+i, leafNodeRadius, mouseOverLeafNode, mouseOutLeafNode);
	}
	*/

	/*
	var nodeID = "ref-0";
	var refNodeNo1 = visualizerModule.getNodeById(nodeID);
	//console.log(JSON.stringify(refNodeNo1));

	var nodeCenter = visualizerModule.getNodeCenterById(nodeID);
	//console.log(JSON.stringify(nodeCenter));
	*/

	const doi = "10.1103/physrevlett.98.010505";
	getMetadataWithDoi(doi, function(err, metadata){
		if(!err) {
			if(metadata.DOI) {
				const rootNodeRadius = 30;
				var rootNode = visualizerModule.createRootNode(rootNodeRadius, 500, 500, "root-"+metadata.DOI, mouseOverRootNode, mouseOutRootNode);
				
				var referencesList = metadata.reference;

				const leafNodeRadius = 15;
				var referenceNo = 0;
				referencesList.forEach(function(referenceObj){
					if(referenceObj.DOI) {
						visualizerModule.createReferenceNode(rootNode, referenceNo, "ref-"+referenceObj.DOI, leafNodeRadius, mouseOverLeafNode, mouseOutLeafNode);
					} else {
						visualizerModule.createReferenceNode(rootNode, referenceNo, "ref-"+referenceObj.key, leafNodeRadius, mouseOverLeafNode, mouseOutLeafNode);
					}
					referenceNo++;
				});
			} else {
				console.log("Doi does not exist in rootnode metadata");
			}
		} else {
			console.log("Error occured while fetching metadata");
		}
	});
}

document.addEventListener("DOMContentLoaded", function(event) {
	console.log("DOM fully loaded and parsed");
	initializeScript();
});