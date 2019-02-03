
const backendApi = {
	cursorStatusPostTopic: "/cursor-status-changed",
	getCrossrefMetaDataByDoi: "/get-crossref-metadata-by-doi"
};

const sendRequestsTopic = "listen-renderer";
const listenResponsesTopic = "response-to-renderer";

const konvaDivID = "konva-div";
const overlayDivID = "overlay-div";

function request(apiUrl, requestObj, callback) {
	ipcRestRenderer.request(apiUrl, requestObj, callback);
}

function getMetadataWithDoi(doi, callback) {
	const requestObj = {"doi": doi};
	request(backendApi.getCrossrefMetaDataByDoi, requestObj, function(err, responseObj){
		if(!err) {
			var metadata = responseObj.metadata;
			callback(null, metadata);
		} else {
			console.log("Error occured: "+err.msg);
			callback(err, null);
		}
	});
}

function getDoiListOfReferences(referenceList) {
	var doiList = [];
	referenceList.forEach(function(referenceObj){
		if(referenceObj.DOI) {
			doiList.push(referenceObj.DOI);
		} else {
			console.log("No DOI found for given reference metadata.");
		}
	});
	return doiList;
}

function nodeDragStartCallback(nodeType, nodeObj) {
	if(nodeType == "root") {
		console.log("Type of rootnode");
	} else if (nodeType == "ref") {
		console.log("Type of reference node");
	} else if (nodeType == "citedby") {
		console.log("Type of citedby node");
	} else {
		console.log("Unknown type: "+nodeType);
	}
}

function nodeDragEndCallback(nodeType, nodeObj) {
	if(nodeType == "root") {
		console.log("Type of rootnode");
	} else if (nodeType == "ref") {
		console.log("Type of reference node");
		const x = nodeObj.getAbsolutePosition().x;
		const y = nodeObj.getAbsolutePosition().y;
		const doi = nodeObj.metadata.DOI;
		const ID = nodeObj.getID();

		var rootNodeOfReferenceID = nodeObj.getRootNodeID();
		knowledgeTree.removeReferenceFromRootNode(rootNodeOfReferenceID, ID);
		createRootNodeFromDoi(doi, x, y, function(newRootNodeID){
			//rootNodeOfReference.addSiblingReference(newRootNode);
			const rootID = rootNodeOfReferenceID;
			knowledgeTree.setSiblingReference(rootID, newRootNodeID);
		});
	} else if (nodeType == "citedby") {
		console.log("Type of citedby node");
	} else {
		console.log("Unknown type: "+nodeType);
	}
}

function createRootNodeFromDoi(doi, x, y, rootNodeCreatedCallback){
	console.log("Create root node at "+x+","+y);
	getMetadataWithDoi(doi, function(err, metadata){
		if(!err) {
			if(metadata.DOI) {
				const rootNodeRadius = 30;
				var rootNodeObjectID = knowledgeTree.createRootNode(metadata, 30, x, y);
				rootNodeCreatedCallback(rootNodeObjectID);
				if(metadata.reference) {
					var referenceList = metadata.reference;
					var referenceDoiList = getDoiListOfReferences(referenceList);

					const leafNodeRadius = 15;
					var fetchedMetadataCount = 0;
					const doiCount = referenceDoiList.length;
					const fetchIntervalMs = 100;
					var myVar = setInterval(function(){
							fetchedMetadataCount++;
							if(fetchedMetadataCount==doiCount) clearInterval(myVar);
							getMetadataWithDoi(referenceDoiList[fetchedMetadataCount-1], function(err, refMetadata){
								if(!err && refMetadata.DOI) {
									knowledgeTree.addReferenceToRootNode(rootNodeObjectID, refMetadata, leafNodeRadius);
								} else {
									console.log("OOps, something went wrong while fetching reference metadata.");
								} 
							});
					}, fetchIntervalMs);
				} else {
					console.log("Unable to find references.");
					//console.log(JSON.stringify(metadata));
				}
			} else {
				console.log("Doi does not exist in rootnode metadata");
			}
		} else {
			console.log("Error occured while fetching metadata");
		}
	});
}


function createNodeRequestReceivedCallback(x, y) {
	overlayerModule.promptUser("Insert DOI", function(userInput){
		createRootNodeFromDoi(userInput, x, y, function(newRootNodeID){
			//console.log("Root node created: "+newRootNodeID);
		});
	});
}
var knowledgeTree = null;

function initializeScript() {
	ipcRestRenderer.initialize(sendRequestsTopic, listenResponsesTopic);
	overlayerModule.initializeModule(overlayDivID);
	knowledgeTree = new KnowledgeTree(konvaDivID, 1600, 1200);

	knowledgeTree.setNodeCreateRequestCallback(createNodeRequestReceivedCallback);
	knowledgeTree.setNodeDragStartCallback(nodeDragStartCallback);
	knowledgeTree.setNodeDragEndCallback(nodeDragEndCallback);

	const LEFT = 37;
	const RIGHT = 39;
	const UP = 38;
	const DOWN = 40;
	const SPACE = 32;
	document.getElementById("body").addEventListener("keyup", function(event) {
		event.preventDefault();
		if (event.keyCode === LEFT) {
			knowledgeTree.moveCamera(50,0);
		} else if (event.keyCode === RIGHT) {
			knowledgeTree.moveCamera(-50,0);
		} else if (event.keyCode === UP) {
			knowledgeTree.moveCamera(0,50);
		} else if (event.keyCode === DOWN) {
			knowledgeTree.moveCamera(0,-50);
		} else if (event.keyCode === SPACE) {
			console.log("SPACE");
			console.log(knowledgeTree.serialize());
		}
	});
/* CLick to create rootnode
	document.getElementById("body").addEventListener("click", function(event) {
		console.log("Camera Posiiton"+JSON.stringify(knowledgeTree.getCameraPosition()));
		console.log("Mouse Position on Camera"+JSON.stringify(knowledgeTree.getMousePositionOnCamera()));
		console.log("Mouse Absolute Position "+JSON.stringify(knowledgeTree.getMouseAbsolutePosition()));
		createRootNodeFromDoi("10.1103/physrevlett.98.010505", knowledgeTree.getMouseAbsolutePosition().x, knowledgeTree.getMouseAbsolutePosition().y, function(){});
	});
*/
}

document.addEventListener("DOMContentLoaded", function(event) {
	console.log("DOM fully loaded and parsed");
	initializeScript();
});