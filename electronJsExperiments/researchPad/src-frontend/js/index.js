
const backendApi = {
	getCrossrefMetaDataByDoi: "/get-crossref-metadata-by-doi",
	getHostname: "/get-hostname",
	searchGoogleScholar: "/search-google-scholar",
	getCitedByFromGoogleScholar: "/get-citedby-google-scholar",
	isChromiumReady: "/get-chromium-status"
};

const sendRequestsTopic = "listen-renderer";
const listenResponsesTopic = "response-to-renderer";

const konvaDivID = "konva-div";
const overlayDivID = "overlay-div";
const abstractDivID = "overlay-abstract-div";

const upperPanelDivID = "overlay-controlset-upper-panel";

const searchPanelDivID = "overlay-search-panel";
const searchDivID = "search-results-div";

const baseDivId = "knowledge-tree-div";
const nodeEssentialClassName = "node-essential-div";
const nodeExtraUpperClassName = "node-extra-upper-div";

const nodeConnectionsConfig = {
	citedByAbsoluteStartDegree: 280,
	citedByAbsoluteEndDegree: 90,
	referenceAbsoluteStartDegree: 120,
	referenceAbsoluteEndDegree: 240,
	connectionLength: 50,
	maxConnectionPerLayer: 10
};

const LEAF_NODE_HIDE_DURATION_SEC = 3;

function request(apiUrl, requestObj, callback) {
	ipcRestRenderer.request(apiUrl, requestObj, callback);
}

function getChromiumStatus(callback) {
	const requestObj = {};
	request(backendApi.isChromiumReady, requestObj, function(err, responseObj){
		if(!err) {
			var status = responseObj.chorimumStatus;
			callback(null, status);
		} else {
			loggerModule.error("error", "unable to get chromiumStatus");
			callback(err, null);
		}
	});
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

function getCitedByOfArticle(citedByLink, callback) {
	const requestObj = {"citedByLink": citedByLink};
	request(backendApi.getCitedByFromGoogleScholar, requestObj, function(err, responseObj){
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
		const x = nodeObj.getAbsolutePosition().x;
		const y = nodeObj.getAbsolutePosition().y;
		const citedByLink = nodeObj.getCitedByLink();
		const ID = nodeObj.getID();
		const rootNodeOfReferenceID = nodeObj.getRootNodeID();
		const citedByNodeMetadata = nodeObj.getMetadata();

		if(citedByLink) {
			knowledgeTree.removeCitedbyFromRootNode(rootNodeOfReferenceID, ID);

			const rootNodeRadius = 30;
			var newRootNodeID = knowledgeTree.createRootNode(citedByNodeMetadata, rootNodeRadius, x, y);
			knowledgeTree.setSiblingReference(rootNodeOfReferenceID, newRootNodeID);

			getCitedByOfArticle(citedByLink, function(err, citedByList){
				const leafNodeRadius = 15;
				if(citedByList) {
					citedByList.forEach(function(citedByMetadata){
						knowledgeTree.addCitedbyToRootNode(newRootNodeID, citedByMetadata, leafNodeRadius);
					});
				} else {
					overlayerModule.informUser("Unable to fetch citations data.");
				}
			});
		} else {
			knowledgeTree.removeCitedbyFromRootNode(rootNodeOfReferenceID, ID);

			const rootNodeRadius = 30;
			var newRootNodeID = knowledgeTree.createRootNode(citedByNodeMetadata, rootNodeRadius, x, y);
			knowledgeTree.setSiblingReference(rootNodeOfReferenceID, newRootNodeID);
		}

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


function offset(el) {
	var rect = el.getBoundingClientRect(),
	scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
	scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

function searchResultMouseEnterCallback(e) {
	const target = e.target;
	var rect = offset(target);


	const targetTagNo = parseInt(target.getAttribute("tagNo"));
	const abstractText = lastGoogleSearchData[targetTagNo].abstract;
	const authors = lastGoogleSearchData[targetTagNo].authors;
	const journal = lastGoogleSearchData[targetTagNo].journal;
	const x = rect.left;
	const y = rect.top + (target.offsetHeight/2);

	var authorText = "";
	authors.forEach(function(author, i){
		if(i != (authors.length-1))
			authorText += author + ", ";
		else
			authorText += author;
	});
	
	overlayerModule.drawAbstractOverlay(x, y, abstractText, journal, authorText);
	
}

function searchResultMouseLeaveCallback(e) {
	overlayerModule.clearAbstractOverlay();
}

var lastGoogleSearchData;
function searchRequestReceivedCallback(userInput) {
	searchPanel.clearResults();
	searchGoogle(userInput, function(err, result){
		if(result && result.length > 0) {
			lastGoogleSearchData = result;
			var i = 0;
			result.forEach(function(element){
				searchPanel.addResultElement(i, element.title, element.citedByCount, element.year, element.abstract, searchResultMouseEnterCallback, searchResultMouseLeaveCallback); //Input element ID as well.
				i++;
			});
			searchPanel.enableNextSearch();
		} else if (result && result.length == 0) {
			overlayerModule.informUser("No result is found for that search.");
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
var draggedSearchElementTagNo = null;
function handleMouseDown(event) {
	//document.getElementById("body").style.cursor = "move";
	const isSearchElement = isIdExistInParentElements(event.target, searchDivID);
		if(isSearchElement) {
			isSearchElementDraggingStarted = true;
			draggedSearchElementTagNo = event.target.getAttribute("tagNo")
			searchPanel.setColorOfSearchResultElement(draggedSearchElementTagNo, "yellow");
		}
}

function handleMouseUp(event) {
	//document.getElementById("body").style.cursor = "default";
	if(isSearchElementDraggingStarted) {
		isSearchElementDraggingStarted = false;
		const isTargetPointsKnowledgeTree = isIdExistInParentElements(event.target, konvaDivID);
		if(isTargetPointsKnowledgeTree) {
			searchPanel.setColorOfSearchResultElement(draggedSearchElementTagNo, "green");
			console.log("Mouse x: "+event.clientX+" Mouse y: "+event.clientY);

			const pos = knowledgeTree.getAbsolutePositionOfGivenPos(event.clientX,event.clientY);
			
			const googleSearchDataPosition = parseInt(draggedSearchElementTagNo);
			var scholarSearchMetadata = lastGoogleSearchData[googleSearchDataPosition];

			const rootNodeRadius = 30;
			var rootNodeObjectID = knowledgeTree.createRootNode(scholarSearchMetadata, rootNodeRadius, pos.x, pos.y);
			
			getCitedByOfArticle(scholarSearchMetadata.citedByLink, function(err, citedByList){
				const leafNodeRadius = 15;
				if(citedByList) {
					console.log(citedByList);
					citedByList.forEach(function(citedByMetadata){
						knowledgeTree.addCitedbyToRootNode(rootNodeObjectID, citedByMetadata, leafNodeRadius);
					});
				} else {
					console.log("Err cited by fetch");
				}
			});
		} else {
			searchPanel.setColorOfSearchResultElement(draggedSearchElementTagNo, "");
		}
		
	}
}

function nodeMouseOverCallback(nodeType, nodeObj) {
	if(nodeDetailsStaticOverlayer.isExtraContentBeingDisplayed()) {
		console.log("EXTRA CONTENT BEING DISPLAYED. YOU CAN NOT TAKE A LOOK AT ANOTHER NODE.");
	} else {
		if(nodeType == "root") {
			document.body.style.cursor = 'pointer';
			var nodeCenter = nodeObj.getPositionOnCamera();
			var nodeRadius = visualizerModule.getNodeRadiusById(nodeObj.getID());
	
			const title = nodeObj.getTitle() || "No title";
			const authors = nodeObj.getAuthors() || "No author";
			const year = nodeObj.getYear() || "No year";
			const journal = nodeObj.getJournal() || "No journal";
			const citationCount = nodeObj.getCitationCount() || "No citation.";
	
			//overlayerModule.drawTitleOverlay((nodeCenter.x+nodeRadius), (nodeCenter.y-nodeRadius), title, authors, year, journal, citationCount);
			nodeDetailsStaticOverlayer.setContent(title, year, citationCount);
			nodeDetailsStaticOverlayer.showEssential((nodeCenter.x+nodeRadius), (nodeCenter.y-nodeRadius));
	
			knowledgeTree.showLeafNodes(nodeObj.getID());
		} else if (nodeType == "ref") {
			console.log("Type of reference node");
		} else if (nodeType == "citedby") {
			if(!nodeObj.isHiddenNode()) {
				document.body.style.cursor = 'pointer';
				var nodeCenter = nodeObj.getPositionOnCamera();
				var nodeRadius = visualizerModule.getNodeRadiusById(nodeObj.getID());
				
				const title = nodeObj.getTitle() || "No title";
				const authors = nodeObj.getAuthors() || "No author";
				const year = nodeObj.getYear() || "No year";
				const journal = nodeObj.getJournal() || "No journal";
				const citationCount = nodeObj.getCitationCount() || "No citation.";
			
				//overlayerModule.drawTitleOverlay((nodeCenter.x+nodeRadius), (nodeCenter.y-nodeRadius), title, authors, year, journal, citationCount);
				nodeDetailsStaticOverlayer.setContent(title, year, citationCount);
				nodeDetailsStaticOverlayer.showEssential((nodeCenter.x+nodeRadius), (nodeCenter.y-nodeRadius));
	
				const rootNodeID = nodeObj.getRootNodeID();
				knowledgeTree.showLeafNodes(rootNodeID);
			}
		} else {
			console.log("Unknown type name: "+nodeType);
		}
	}
}

function nodeMouseOutCallback(nodeType, nodeObj) {
	if(nodeDetailsStaticOverlayer.isExtraContentBeingDisplayed()) {
		console.log("EXTRA CONTENT BEING DISPLAYED. YOU CAN NOT TAKE A LOOK AT ANOTHER NODE.");
	} else {
		if(nodeType == "root") {
			document.body.style.cursor = 'default';
			if(knowledgeTree.isSelectedRootNode(nodeObj)){
				//overlayerModule.clearTitleOverlay();
			} else {
				knowledgeTree.hideLeafNodes(nodeObj.getID(), LEAF_NODE_HIDE_DURATION_SEC);
				//overlayerModule.clearTitleOverlay();
				nodeDetailsStaticOverlayer.hideEssential();
			}
		} else if (nodeType == "ref") {
			console.log("Type of reference node");
		} else if (nodeType == "citedby") {
			if(!nodeObj.isHiddenNode()) {
				document.body.style.cursor = 'default';
				//overlayerModule.clearTitleOverlay();
				nodeDetailsStaticOverlayer.hideEssential();
	
				const rootNodeId = nodeObj.getRootNodeID();
				knowledgeTree.hideLeafNodes(rootNodeId, LEAF_NODE_HIDE_DURATION_SEC);
			}
		} else {
			console.log("Unknown type name: "+nodeType);
		}
	}
}

function nodeClickedCallback(nodeType, nodeObj) {
	console.log("click")
	if(nodeType == "root") {
		if(knowledgeTree.isSelectedRootNode(nodeObj)) {
			knowledgeTree.deselectRootNode(nodeObj);
			nodeObj.hideLeafNodes();
			nodeDetailsStaticOverlayer.hideExtraContent();
			console.log("deselected root node");
		} else {
			knowledgeTree.selectRootNode(nodeObj);
			nodeObj.showLeafNodes();
			nodeDetailsStaticOverlayer.showExtraContent();
			console.log("selected root node");
		}
		console.log("Clicked: Type of Rootnode");
	} else if (nodeType == "ref") {
		console.log("Clicked:  Type of reference node");
	} else if (nodeType == "citedby") {
		console.log("Clicked: Type of citedby");
	} else {
		console.log("Clicked: Unknown type name: "+nodeType);
	}
}

var knowledgeTree = null;
var searchPanel = null;
var nodeDetailsStaticOverlayer = null;

function initializeScript() {
	ipcRestRenderer.initialize(sendRequestsTopic, listenResponsesTopic);
	overlayerModule.initializeModule(overlayDivID, upperPanelDivID, abstractDivID);

	knowledgeTree = new KnowledgeTree(konvaDivID, 1600, 1200, nodeConnectionsConfig);

	knowledgeTree.setNodeCreateRequestCallback(createNodeRequestReceivedCallback);
	knowledgeTree.setNodeDragStartCallback(nodeDragStartCallback);
	knowledgeTree.setNodeDragEndCallback(nodeDragEndCallback);
	knowledgeTree.setNodeMouseOverCallback(nodeMouseOverCallback);
	knowledgeTree.setNodeMouseOutCallback(nodeMouseOutCallback);
	knowledgeTree.setNodeClickedCallback(nodeClickedCallback);

	searchPanel = new SearchPanel(searchPanelDivID);
	searchPanel.setSearchRequestReceivedCallback(searchRequestReceivedCallback);

	nodeDetailsStaticOverlayer = new NodeDetailsStaticOverlayer(baseDivId, nodeEssentialClassName, nodeExtraUpperClassName);

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
			nodeDetailsStaticOverlayer.updatePosition(moveLength, 0);
			//overlayerModule.clearTitleOverlay();
			loggerModule.log("action", "keypressed", {"direction": "left"});
		} else if (event.keyCode === RIGHT) {
			event.preventDefault();
			knowledgeTree.moveCamera(-moveLength,0);
			nodeDetailsStaticOverlayer.updatePosition(-moveLength, 0);
			//overlayerModule.clearTitleOverlay();
			loggerModule.log("action", "keypressed", {"direction": "right"});
		} else if (event.keyCode === UP) {
			event.preventDefault();
			knowledgeTree.moveCamera(0,moveLength);
			nodeDetailsStaticOverlayer.updatePosition(0, moveLength);
			//overlayerModule.clearTitleOverlay();
			loggerModule.log("action", "keypressed", {"direction": "up"});
		} else if (event.keyCode === DOWN) {
			event.preventDefault();
			knowledgeTree.moveCamera(0,-moveLength);
			nodeDetailsStaticOverlayer.updatePosition(0, -moveLength);
			//overlayerModule.clearTitleOverlay();
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

	/*
	setInterval(function(){
		getChromiumStatus(function(err, res){
			console.log("Is chromium initialized: "+res);
		});
	}, 5000);
	*/
	//implement built-in exit button (disable default one as well) to also log exit event.
}

document.addEventListener("DOMContentLoaded", function(event) {
	initializeScript();
	console.log("DOM fully loaded and parsed");
});