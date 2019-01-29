
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
	const requestObj = {"doi": doi}; //doi = "10.1103/physrevlett.98.010505"
	request(backendApi.getCrossrefMetaDataByDoi, requestObj, function(err, responseObj){
		if(!err) {
			var metadata = responseObj.metadata;

			//console.log("Metadatafetched from backend.");
			//console.log(JSON.stringify(metadata));
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

function dragStart(nodeObject){
	console.log("Drag Start "+nodeObject.ID);
	if(nodeObject.constructor.name == "RootNode") {
		console.log("Type of rootnode");
	} else if (nodeObject.constructor.name == "ReferenceNode") {
		console.log("Type of reference node");
		//nodeObject.setPlaceholderState(true);
	} else if (nodeObject.constructor.name == "CitedByNode") {
		console.log("Type of citedby node");
	} else {
		console.log("Unknown type.");
		console.log(nodeObject.constructor.name);
	}
}
function dragEnd(nodeObject) {
	console.log("Drag Start "+nodeObject.ID);
	if(nodeObject.constructor.name == "RootNode") {
		console.log("Type of rootnode");
	} else if (nodeObject.constructor.name == "ReferenceNode") {
		console.log("Type of reference node");
		const x = nodeObject.getCenterX();
		const y = nodeObject.getCenterY();
		const doi = nodeObject.metadata.DOI;
		const ID = nodeObject.getID();

		var rootNodeOfReference = nodeObject.getRootNode();
		rootNodeOfReference.removeReference(ID);
		createRootNodeFromDoi(doi, x, y, function(newRootNode){
			rootNodeOfReference.addSiblingReference(newRootNode);
		});
	} else if (nodeObject.constructor.name == "CitedByNode") {
		console.log("Type of citedby node");
	} else {
		console.log("Unknown type.");
		console.log(nodeObject.constructor.name);
	}
}

function createRootNodeFromDoi(doi, x, y, rootNodeCreatedCallback){
	getMetadataWithDoi(doi, function(err, metadata){
		if(!err) {
			if(metadata.DOI) {
				const rootNodeRadius = 30;
				var rootNodeObject = new RootNode("root-"+metadata.DOI, metadata, 30, x, y, dragStart, dragEnd);
				rootNodeCreatedCallback(rootNodeObject);
				var rootNode = rootNodeObject.getVisualObject();
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
									rootNodeObject.createReference("ref-"+refMetadata.DOI, refMetadata, leafNodeRadius);
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

var emptyRootNodeConfig = {
	emptyRootNode: null,
	x: 50,
	y: 50,
	ID: "emptyRootNode",
	radius: 30,
	opacity: 0.6
};

function emptyRootNodeDragStart(emptyRootNode) {
	emptyRootNode.setOpacity(emptyRootNodeConfig.opacity);
	console.log("Empty rootnode: drag start");
}

function emptyRootNodeEnd(emptyRootNode) {
	const x = emptyRootNode.getCenterX();
	const y = emptyRootNode.getCenterY();

	console.log("Empty rootnode: drag end");
	overlayerModule.promptUser("Insert DOI", function(userInput){
		console.log("HEY HEY HEY!!!!" + userInput);
		emptyRootNode.setPosition(emptyRootNodeConfig.x, emptyRootNodeConfig.y);
		createRootNodeFromDoi(userInput, x, y, function(newRootNode){
			console.log("Root node created");
		});
	});
	//prompt user with overlay
	//if successfull, create rootnode at current position
	//else show error

	//reposition node back to initial place.
}

function initializeVisualToolset() {
	emptyRootNodeConfig.emptyRootNode = DummyNode(emptyRootNodeConfig.ID, emptyRootNodeConfig.radius, emptyRootNodeConfig.x, emptyRootNodeConfig.y, emptyRootNodeDragStart, emptyRootNodeEnd);
}

function initializeScript() {
	ipcRestRenderer.initialize(sendRequestsTopic, listenResponsesTopic);
	visualizerModule.initializeModule(konvaDivID, 1600, 1200);
	overlayerModule.initializeModule(overlayDivID);

	initializeVisualToolset();
}

document.addEventListener("DOMContentLoaded", function(event) {
	console.log("DOM fully loaded and parsed");
	initializeScript();
});