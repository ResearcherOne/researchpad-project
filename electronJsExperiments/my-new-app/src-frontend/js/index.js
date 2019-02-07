
const backendApi = {
	getCrossrefMetaDataByDoi: "/get-crossref-metadata-by-doi",
	getHostname: "/get-hostname"
};

const sendRequestsTopic = "listen-renderer";
const listenResponsesTopic = "response-to-renderer";

const konvaDivID = "konva-div";
const overlayDivID = "overlay-div";
const upperPanelDivID = "overlay-controlset-upper-panel";
const searchPanelDivID = "overlay-search-panel";

var errorArray = [];
var pushErrorTimeout = null;
var pushErrorTimeoutSec = 5;

function error(type, msg) {
	msg = msg.replace(/\s+/g, '-').toLowerCase();
	errorArray.push(type+"-"+msg);
	if(pushErrorTimeout) {
		clearTimeout(pushErrorTimeout);
	}
	pushErrorTimeout = setTimeout(function(){
		console.log("error-bulk: "+JSON.stringify(errorArray));
		mixpanel.track("error-bulk", {"errors":errorArray});
		errorArray = [];
	}, pushErrorTimeoutSec*1000);
	
}

function log(type, msg, extraData) {
	msg = msg.replace(/\s+/g, '-').toLowerCase();
	console.log("system-log-"+type+": "+msg);
	if(extraData) {
		extraData.systemMessage = msg;
		mixpanel.track(type+"-"+msg, extraData);
	} else {
		mixpanel.track(type+"-"+msg);
	}
}

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
			error("error", "unable to get hostname");
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
			error("error", "unable to get metadataWithDoi");
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
			error("error", "No DOI found for given reference metadata.");
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
	log("action", "nodeDragEnd", {"type": nodeType});
}

function createRootNodeFromDoi(doi, x, y, rootNodeCreatedCallback){
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
									error("error", "unable to fetch reference metadata");
								} 
							});
					}, fetchIntervalMs);
				} else {
					error("error", "unable to find references");
				}
			} else {
				error("error", "DOI does not exist in fetched metadata");
			}
		} else {
			error("error", "Error while fetching metadata");
		}
	});
	log("action", "createRootNodeFromDoi", {"x": x, "y": y, "doi": doi});
}


function createNodeRequestReceivedCallback(x, y) {
	log("action", "emptyNodeDragged");
	overlayerModule.promptUser("Insert DOI", function(userInput){
		createRootNodeFromDoi(userInput, x, y, function(newRootNodeID){
			//console.log("Root node created: "+newRootNodeID);
			const title = knowledgeTree.getRootNodeTitleById(newRootNodeID);
			searchPanel.addResultElement(title);
		});
		log("action", "usertInsertedDOI", {"userInput": userInput});
	});
}

function initializeMixpanel(hostname) {
	mixpanel.identify(hostname);
	mixpanel.people.set({
		"$hostname": hostname,    // only special properties need the $
		"$last_login": new Date(),         // properties can be dates...
	});
	/*
	mixpanel.people.set({
		"$email": "jsmith@example.com",    // only special properties need the $

		"$created": "2011-03-16 16:53:54",
		"$last_login": new Date(),         // properties can be dates...

		"credits": 150,                    // ...or numbers

		"gender": "Male"                    // feel free to define your own properties
	});
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

	getHostname(function(err, hostname){
		initializeMixpanel(hostname);
		log("action", "userlogin", {"username": hostname});
	});
	
	const loadedKnowledgeTreeData = localStorage.getItem("knowledgeTree");
	if(loadedKnowledgeTreeData) {
		knowledgeTree.importSerializedData(loadedKnowledgeTreeData);
		log("log", "knowledge tree loaded");
	} else {
		log("log", "no saved knowledge tree found");
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
			log("action", "keypressed", {"direction": "left"});
		} else if (event.keyCode === RIGHT) {
			event.preventDefault();
			knowledgeTree.moveCamera(-moveLength,0);
			log("action", "keypressed", {"direction": "right"});
		} else if (event.keyCode === UP) {
			event.preventDefault();
			knowledgeTree.moveCamera(0,moveLength);
			log("action", "keypressed", {"direction": "up"});
		} else if (event.keyCode === DOWN) {
			event.preventDefault();
			knowledgeTree.moveCamera(0,-moveLength);
			log("action", "keypressed", {"direction": "down"});
		}
	});

	document.getElementById("save-button").addEventListener("click", function(event){
		event.preventDefault();
		localStorage.setItem("knowledgeTree", knowledgeTree.serialize());
		overlayerModule.displayInfo("Saved.");
		log("action", "save button clicked");
	});

	document.getElementById("reset-button").addEventListener("click", function(event){
		event.preventDefault();
		localStorage.removeItem("knowledgeTree");
		knowledgeTree.destroy();
		knowledgeTree = new KnowledgeTree(konvaDivID, 1600, 1200);

		knowledgeTree.setNodeCreateRequestCallback(createNodeRequestReceivedCallback);
		knowledgeTree.setNodeDragStartCallback(nodeDragStartCallback);
		knowledgeTree.setNodeDragEndCallback(nodeDragEndCallback);

		overlayerModule.displayInfo("Resetted.");
		log("action", "reset button clicked");
	});

	//implement built-in exit button (disable default one as well) to also log exit event.

	overlayerModule.displayInfo("Welcome!");
}

document.addEventListener("DOMContentLoaded", function(event) {
	initializeScript();
	console.log("DOM fully loaded and parsed");
});