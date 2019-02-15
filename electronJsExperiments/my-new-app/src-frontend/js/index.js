
const backendApi = {
	getCrossrefMetaDataByDoi: "/get-crossref-metadata-by-doi",
	getHostname: "/get-hostname",
	searchGoogleScholar: "/search-google-scholar"
};

const sendRequestsTopic = "listen-renderer";
const listenResponsesTopic = "response-to-renderer";

const konvaDivID = "konva-div";
const overlayDivID = "overlay-div";

const upperPanelDivID = "overlay-controlset-upper-panel";

const searchPanelDivID = "overlay-search-panel";
const searchDivID = "search-results-div";

function request(apiUrl, requestObj, callback) {
	ipcRestRenderer.request(apiUrl, requestObj, callback);
}

function getHostname(callback) {
	const requestObj = {};
	request(backendApi.getHostname, requestObj, function(err, responseObj){
		if(!err) {
			var hostname = responseObj.hostname;
			callback(null, hostname);
		} else {
			//console.log("Error occured: "+err.msg);
			loggerModule.error("error", "unable to get hostname");
			callback(err, null);
		}
	});
}

function getMetadataWithDoi(doi, callback) {
	const requestObj = {"doi": doi};
	request(backendApi.getCrossrefMetaDataByDoi, requestObj, function(err, responseObj){
		if(!err) {
			var metadata = responseObj.metadata;
			callback(null, metadata);
		} else {
			loggerModule.error("error", "unable to get metadataWithDoi");
			callback(err, null);
		}
	});
}

function searchGoogle(searchText, callback) {
	const requestObj = {"searchText": searchText};
	request(backendApi.searchGoogleScholar, requestObj, function(err, responseObj){
		if(!err) {
			var resultList = responseObj.resultList;
			callback(null, resultList);
		} else {
			loggerModule.error("error", "unable to get data from google scholar.");
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
			loggerModule.error("error", "No DOI found for given reference metadata.");
		}
	});
	return doiList;
}

function nodeDragStartCallback(nodeType, nodeObj) {
	if(nodeType == "root") {
		//console.log("Type of rootnode");
	} else if (nodeType == "ref") {
		//console.log("Type of reference node");
	} else if (nodeType == "citedby") {
		//console.log("Type of citedby node");
	} else {
		//console.log("Unknown type: "+nodeType);
	}
}

function nodeDragEndCallback(nodeType, nodeObj) {
	if(nodeType == "root") {
		//console.log("Type of rootnode");
	} else if (nodeType == "ref") {
		//console.log("Type of reference node");
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
		//console.log("Type of citedby node");
	} else {
		//console.log("Unknown type: "+nodeType);
	}
	loggerModule.log("action", "nodeDragEnd", {"type": nodeType});
}

function createRootNodeFromDoi(doi, x, y, rootNodeCreatedCallback){
	getMetadataWithDoi(doi, function(err, metadata){
		if(!err) {
			if(metadata.DOI) {
				const rootNodeRadius = 30;
				var rootNodeObjectID = knowledgeTree.createRootNode(metadata, rootNodeRadius, x, y);
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
									loggerModule.error("error", "unable to fetch reference metadata");
								} 
							});
					}, fetchIntervalMs);
				} else {
					loggerModule.error("error", "unable to find references");
				}
			} else {
				loggerModule.error("error", "DOI does not exist in fetched metadata");
			}
		} else {
			loggerModule.error("error", "Error while fetching metadata");
		}
	});
	loggerModule.log("action", "createRootNodeFromDoi", {"x": x, "y": y, "doi": doi});
}


function createNodeRequestReceivedCallback(x, y) {
	loggerModule.log("action", "emptyNodeDragged");
	console.log("X: "+x+" Y: "+y);
	overlayerModule.promptUser("Insert DOI", function(userInput){
		createRootNodeFromDoi(userInput, x, y, function(newRootNodeID){
			//console.log("Root node created: "+newRootNodeID);
		});
		loggerModule.log("action", "usertInsertedDOI", {"userInput": userInput});
	});
}

var lastGoogleSearchData;
function searchRequestReceivedCallback(userInput) {
	searchPanel.clearResults();
	searchGoogle(userInput, function(err, result){
		if(result) {
			lastGoogleSearchData = result;
			var i = 0;
			result.forEach(function(element){
				console.log(JSON.stringify(element));
				searchPanel.addResultElement(i, element.title); //Input element ID as well.
				i++;
			});
			searchPanel.enableNextSearch();
		} else {
			console.log("Unable to connect to Google Scholar.");
			overlayerModule.informUser("Unable to connect to Google Scholar.");
			searchPanel.enableNextSearch();
		}
	});
}

function isIdExistInParentElements(elem, idToSearch){
	var parentElement = elem.parentElement;
	if(!parentElement)
		return false;

	if(parentElement.id == idToSearch) {
		return true;
	} else {
		return isIdExistInParentElements(parentElement, idToSearch);
	}
}

var isSearchElementDraggingStarted = false;
var draggedSearchElement = null;
function handleMouseDown(event) {
	const isSearchElement = isIdExistInParentElements(event.target, searchDivID);
		if(isSearchElement) {
			isSearchElementDraggingStarted = true;
			event.target.style.color = "yellow";
			draggedSearchElement = event.target;
			//animator.startElementDragAnim();
		}
}

function handleMouseUp(event) {
	if(isSearchElementDraggingStarted) {
		const isTargetPointsKnowledgeTree = isIdExistInParentElements(event.target, konvaDivID);
		if(isTargetPointsKnowledgeTree) {
			draggedSearchElement.style.color = "green";
			console.log("Mouse x: "+event.clientX+" Mouse y: "+event.clientY);

			const pos = knowledgeTree.getAbsolutePositionOfGivenPos(event.clientX,event.clientY);
			
			const googleSearchDataPosition = parseInt(draggedSearchElement.getAttribute("tagNo"));
			var scholarSearchMetadata = lastGoogleSearchData[googleSearchDataPosition];

			const rootNodeRadius = 30;
			var rootNodeObjectID = knowledgeTree.createRootNode(scholarSearchMetadata, rootNodeRadius, pos.x, pos.y);
		} else {
			draggedSearchElement.style.color = "";
		}
		
	}
	/*
		if (isSearchElementDragStarted) {
			isSearchElementDragStarted = false;
			//searchPanel.setItemColor(itemDivID, "green");
			//knowledgeTree.createNode(elementCenterX, elementCenterY,metadata);
			animator.stopElementDragAnim();
		} else {
			ignore, it could be any kind of click on konvaDiv.
		}

	*/
}

var knowledgeTree = null;
var searchPanel = null;

function initializeScript() {
	ipcRestRenderer.initialize(sendRequestsTopic, listenResponsesTopic);
	overlayerModule.initializeModule(overlayDivID, upperPanelDivID);

	knowledgeTree = new KnowledgeTree(konvaDivID, 1600, 1200);

	knowledgeTree.setNodeCreateRequestCallback(createNodeRequestReceivedCallback);
	knowledgeTree.setNodeDragStartCallback(nodeDragStartCallback);
	knowledgeTree.setNodeDragEndCallback(nodeDragEndCallback);

	searchPanel = new SearchPanel(searchPanelDivID);
	searchPanel.setSearchRequestReceivedCallback(searchRequestReceivedCallback);

	getHostname(function(err, hostname){
		loggerModule.initialize(hostname);
		loggerModule.log("action", "userlogin", {"username": hostname});
	});
	
	const loadedKnowledgeTreeData = localStorage.getItem("knowledgeTree");
	if(loadedKnowledgeTreeData) {
		knowledgeTree.importSerializedData(loadedKnowledgeTreeData);
		loggerModule.log("log", "knowledge tree loaded");
	} else {
		loggerModule.log("log", "no saved knowledge tree found");
	}
	

	const LEFT = 37;
	const RIGHT = 39;
	const UP = 38;
	const DOWN = 40;
	document.addEventListener("keydown", function(event) {
		const moveLength = 60;
		if (event.keyCode === LEFT) {
			event.preventDefault();
			knowledgeTree.moveCamera(moveLength,0);
			loggerModule.log("action", "keypressed", {"direction": "left"});
		} else if (event.keyCode === RIGHT) {
			event.preventDefault();
			knowledgeTree.moveCamera(-moveLength,0);
			loggerModule.log("action", "keypressed", {"direction": "right"});
		} else if (event.keyCode === UP) {
			event.preventDefault();
			knowledgeTree.moveCamera(0,moveLength);
			loggerModule.log("action", "keypressed", {"direction": "up"});
		} else if (event.keyCode === DOWN) {
			event.preventDefault();
			knowledgeTree.moveCamera(0,-moveLength);
			loggerModule.log("action", "keypressed", {"direction": "down"});
		}
	});

	document.getElementById("save-button").addEventListener("click", function(event){
		event.preventDefault();
		localStorage.setItem("knowledgeTree", knowledgeTree.serialize());
		overlayerModule.informUser("Your Knowledge Tree is saved.");
		loggerModule.log("action", "save button clicked");
	});

	document.getElementById("reset-button").addEventListener("click", function(event){
		event.preventDefault();
		localStorage.removeItem("knowledgeTree");
		knowledgeTree.destroy();
		knowledgeTree = new KnowledgeTree(konvaDivID, 1600, 1200);

		knowledgeTree.setNodeCreateRequestCallback(createNodeRequestReceivedCallback);
		knowledgeTree.setNodeDragStartCallback(nodeDragStartCallback);
		knowledgeTree.setNodeDragEndCallback(nodeDragEndCallback);

		overlayerModule.informUser("Your Knowledge Tree is resetted.");
		loggerModule.log("action", "reset button clicked");
	});

	document.addEventListener("mousedown", handleMouseDown);
	document.addEventListener("mouseup", handleMouseUp);

	//implement built-in exit button (disable default one as well) to also log exit event.
}

document.addEventListener("DOMContentLoaded", function(event) {
	initializeScript();
	console.log("DOM fully loaded and parsed");
});