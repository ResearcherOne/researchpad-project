//Index.js Sections
	//Configurations
	//Backend Communication
	//UI Helper Functions
	//Handle UI Actions
	//User Action Helper Functions
	//Handle User Actions (Aggregated from UI Actions)
	//Initialization
//THIS IS A CHANGE FOR THE BAD COMMIT
//Configurations
	const BACKEND_API = {
		//getCrossrefMetaDataByDoi: "/get-crossref-metadata-by-doi",
		getHostname: "/get-hostname",
		searchGoogleScholar: "/search-google-scholar",
		searchArxiv: "/search-arxiv",
		getCitedByFromGoogleScholar: "/get-citedby-google-scholar",
		getSemanticScholarData: "/get-semantic-scholar",
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

	const trashBinDivID = "overlay-trashbin-mouse-area";

	const baseDivId = "knowledge-tree-div";
	const nodeEssentialClassName = "node-essential-div";
	const nodeExtraUpperClassName = "node-extra-upper-div";
	const nodeExtraLowerClassName = "node-extra-lower-div";

	const NODE_CONNECTIONS_CONFIG = {
		citedByAbsoluteStartDegree: 280,
		citedByAbsoluteEndDegree: 90,
		referenceAbsoluteStartDegree: 120,
		referenceAbsoluteEndDegree: 240,
		connectionLength: 50,
		maxConnectionPerLayer: 10
	};

	const LEAF_NODE_HIDE_DURATION_SEC = 1.5;

	const AVAILABLE_SEARCH_PLATFORMS = {
		GOOGLE: "google",
		ARXIV: "arxiv"
	};
	var CURRENT_SEARCH_PLATFORM = AVAILABLE_SEARCH_PLATFORMS.GOOGLE;

	const SEMANTIC_SCHOLAR_SEARCH_METHODS = {
		arxivId: "arxivId",
		semananticId: "semanticId"
	}
//Backend Communication
	function request(apiUrl, requestObj, callback) {
		ipcRestRenderer.request(apiUrl, requestObj, callback);
	}
	/*
	function getChromiumStatus(callback) {
		const requestObj = {};
		request(BACKEND_API.isChromiumReady, requestObj, function(err, responseObj){
			if(!err) {
				var status = responseObj.chorimumStatus;
				callback(null, status);
			} else {
				loggerModule.error("error", "unable to get chromiumStatus");
				callback(err, null);
			}
		});
	}
	*/
	function getHostname(callback) {
		const requestObj = {};
		request(BACKEND_API.getHostname, requestObj, function(err, responseObj){
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
	function performSearch(searchPlatform, searchText, callback) {
		const requestObj = {"searchText": searchText};
		var api;
		if(searchPlatform == AVAILABLE_SEARCH_PLATFORMS.GOOGLE) {
			api = BACKEND_API.searchGoogleScholar;
		} else if (searchPlatform == AVAILABLE_SEARCH_PLATFORMS.ARXIV) {
			api = BACKEND_API.searchArxiv;
		} else {
			loggerModule.error("error", "unknown search platform requested.");
		}

		request(api, requestObj, function(err, responseObj){
			if(!err) {
				var resultList = responseObj.resultList;
				callback(null, resultList);
			} else {
				loggerModule.error("error", "unable to get data from google scholar.");
				callback(err, null);
			}
		});
	}
	function fetchPaperDetailsFromSemanticScholar(fetchMethod, paperId, callback) {
		const requestObj = {"fetchMethod": fetchMethod, "paperId": paperId};
		request(BACKEND_API.getSemanticScholarData, requestObj, function(err, responseObj){
			if(!err) {
				var result = responseObj.metadata;
				callback(null, result);
			} else {
				loggerModule.error("error", "unable to get data from semantic scholar.");
				callback(err, null);
			}
		});
	}
	function getCitedByOfArticle(citedByLink, callback) {
		const requestObj = {"citedByLink": citedByLink};
		request(BACKEND_API.getCitedByFromGoogleScholar, requestObj, function(err, responseObj){
			if(!err) {
				var resultList = responseObj.resultList;
				callback(null, resultList);
			} else {
				loggerModule.error("error", "unable to get data from google scholar.");
				callback(err, null);
			}
		});
	}

//UI Helper Functions
	function offset(el) {
		var rect = el.getBoundingClientRect(),
		scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
		scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
	}
	function text_truncate(str, length, ending) {
		if (length == null) {
			length = 100;
		}
		if (ending == null) {
			ending = '...';
		}
		if (str.length > length) {
			return str.substring(0, length - ending.length) + ending;
		} else {
			return str;
		}
	};
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
	
//Handle UI Actions
	function nodeDragStartCallback(nodeType, nodeObj) {
		if(nodeType == "root") {
			rootNodeDragStart(nodeObj);
		} else if (nodeType == "ref") {
			referenceNodeDragStart(nodeObj);
		} else if (nodeType == "citedby") {
			citationNodeDragStart(nodeObj);
		} else {
			console.log("Unknown node drag start: "+nodeType);
		}
	}
	function nodeDragEndCallback(nodeType, nodeObj) {
		if(nodeType == "root") {
			rootNodeDragEnd(nodeObj);
		} else if (nodeType == "ref") {
			referenceNodeDragEnd(nodeObj);
		} else if (nodeType == "citedby") {
			citationNodeDragEnd(nodeObj);
		} else {
			console.log("Unknown node drag end: "+nodeType);
		}
		loggerModule.log("action", "nodeDragEnd", {"type": nodeType});
	}
	function searchResultMouseEnterCallback(e) {
		const target = e.target;
		const targetTagNo = parseInt(target.getAttribute("tagNo"));
		var rect = offset(target);
	
		const x = rect.left;
		const y = rect.top + (target.offsetHeight/2);

		displaySearchBarExtraSection(x, y, targetTagNo);
	}
	function searchResultMouseLeaveCallback(e) {
		hideSearchBarExtraSection();
	}

	var IS_SEARCH_ELEMENT_DRAGGING_STARTED = false;
	var DRAGGED_SEARCH_ELEMENT_TAG_NO = null;
	function handleMouseDown(event) {
		//document.getElementById("body").style.cursor = "move";
		const isSearchElement = isIdExistInParentElements(event.target, searchDivID);
		if(isSearchElement) {
			IS_SEARCH_ELEMENT_DRAGGING_STARTED = true;
			DRAGGED_SEARCH_ELEMENT_TAG_NO = event.target.getAttribute("tagNo");
			searchBarElementDragStarted(DRAGGED_SEARCH_ELEMENT_TAG_NO);
		}
	}
	function handleMouseUp(event) {
		//document.getElementById("body").style.cursor = "default";
		if(IS_SEARCH_ELEMENT_DRAGGING_STARTED) {
			IS_SEARCH_ELEMENT_DRAGGING_STARTED = false;
			const isTargetPointsKnowledgeTree = isIdExistInParentElements(event.target, konvaDivID);
			const cursorX = event.clientX;
			const cursorY = event.clientY;
			searchBarElementDragFinished(isTargetPointsKnowledgeTree, cursorX, cursorY);			
		}
	}
	function nodeMouseOverCallback(nodeType, nodeObj) {
		if(nodeDetailsStaticOverlayer.isExtraContentBeingDisplayed()) {
			//DONT SHOW ANYTHING
		} else {
			if(nodeType == "root") {
				document.body.style.cursor = 'pointer';
				showRootNodeEssentialContent(nodeObj);
			} else if (nodeType == "ref") {
				showReferenceNodeEssentialContent(nodeObj);
			} else if (nodeType == "citedby") {
				if(!nodeObj.isHiddenNode()) {
					showCitationNodeEssentialContent(nodeObj);
					document.body.style.cursor = 'pointer';
				}
			} else {
				console.log("Unknown type name: "+nodeType);
			}
		}
	}
	function nodeMouseOutCallback(nodeType, nodeObj) {
		if(nodeDetailsStaticOverlayer.isExtraContentBeingDisplayed()) {
			//pass
		} else {
			if(nodeType == "root") {
				document.body.style.cursor = 'default';
				if(!knowledgeTree.isSelectedNode(nodeObj)){
					hideRootNodeEssentialContent(nodeObj);
				}
			} else if (nodeType == "ref") {
				hideReferenceNodeEssentialContent(nodeObj);
			} else if (nodeType == "citedby") {
				if(!nodeObj.isHiddenNode()) {
					document.body.style.cursor = 'default';
					hideCitationNodeEssentialContent(nodeObj);
				}
			} else {
				console.log("Unknown type name: "+nodeType);
			}
		}
	}
	function nodeClickedCallback(nodeType, nodeObj) {
		if(nodeType == "root") {
			if(knowledgeTree.isSelectedNode(nodeObj)) {
				deselectNode(nodeType, nodeObj);
			} else {
				selectRootNode(nodeObj);
			}
		} else if (nodeType == "ref") {
			selectReferenceNode(nodeObj);
			console.log("Clicked:  Type of reference node");
		} else if (nodeType == "citedby") {
			console.log("Clicked: Type of citedby");
			if(knowledgeTree.isSelectedNode(nodeObj)) {
				deselectNode(nodeType, nodeObj);
			} else {
				selectCitationNode(nodeObj);
			}
		} else {
			console.log("Clicked: Unknown type name: "+nodeType);
		}
	}
	function mapClickedCallback(objName) {
		if(objName !== "node" && knowledgeTree.isSelectedNodeExists()) {
			const selectedNode = knowledgeTree.getSelectedNode();
			const nodeType = knowledgeTree.getNodeType(selectedNode);
			deselectNode(nodeType, selectedNode);
			nodeDetailsStaticOverlayer.hideEssential();
		}
	}
	function viewWebButtonClicked(link) {
		window.open(link);
	}

//User Action Helper Functions
	function createRootNodeFromGoogleScholar(metadata, x ,y, rootNodeRadius, leafNodeRadius) {
		var rootNodeObjectID = knowledgeTree.createRootNode(metadata, rootNodeRadius, x, y);
		getCitedByOfArticle(metadata.citedByLink, function(err, citedByList){
			if(citedByList) {
				console.log(citedByList);
				citedByList.forEach(function(citedByMetadata){
					knowledgeTree.addCitedbyToRootNode(rootNodeObjectID, citedByMetadata, leafNodeRadius);
				});
			} else {
				loggerModule.error("error", "Err cited by fetch.");
			}
		});
	}
	function createRootNodeFromArxiv(metadata, x ,y, rootNodeRadius, leafNodeRadius) {
		var rootNodeObjectID = knowledgeTree.createRootNode(metadata, rootNodeRadius, x, y);
		const fetchMethod = SEMANTIC_SCHOLAR_SEARCH_METHODS.arxivId;
		const paperArxivId = "abc";
		fetchPaperDetailsFromSemanticScholar(fetchMethod, paperArxivId, function(err, result){
			if(result) {
				console.log(result);
			} else {
				loggerModule.error("error", "Err semantic scholar data fetch.");
			}
		});
	}
	function showEssentialContentForNode(nodeObj) {
		var nodeCenter = nodeObj.getPositionOnCamera();
		var nodeRadius = visualizerModule.getNodeRadiusById(nodeObj.getID());
		
		const title = nodeObj.getTitle() || "No title";
		const year = nodeObj.getYear() || "No year";
		const citationCount = nodeObj.getCitationCount() || "No citation.";
		const abstract = nodeObj.getAbstract() || "No abstract";
		const journal = nodeObj.getJournal() || "No journal";
		const authors = nodeObj.getAuthors() || "No author";
		const link = nodeObj.getLink() || "";
		console.log("LINK: "+link);
		
		nodeDetailsStaticOverlayer.setContent(title, year, citationCount, abstract, journal, authors, link);
		nodeDetailsStaticOverlayer.showEssential((nodeCenter.x+(nodeRadius*1.5)), (nodeCenter.y-nodeRadius));
	}
//Handle User Actions (Aggregated from UI Actions)
	function selectRootNode(nodeObj) {
		if(knowledgeTree.isSelectedNodeExists()) {
			knowledgeTree.clearSelectedNode();
		}

		const nodeObjID = nodeObj.getID();
		knowledgeTree.selectNode(nodeObj);
		knowledgeTree.showLeafNodes(nodeObjID);
		showEssentialContentForNode(nodeObj);
		const isUpperContentShown = true;
		nodeDetailsStaticOverlayer.showExtraContent(isUpperContentShown);
		console.log("selected root node");
	}
	function selectCitationNode(nodeObj) {
		if(knowledgeTree.isSelectedNodeExists()) {
			knowledgeTree.clearSelectedNode();
		}
		knowledgeTree.selectNode(nodeObj);
		showEssentialContentForNode(nodeObj);
		const isUpperContentShown = false;
		nodeDetailsStaticOverlayer.showExtraContent(isUpperContentShown);
		console.log("selected citedby node");
	}
	function selectReferenceNode(nodeObj) {

	}
	function deselectNode(nodeType, nodeObj) {
		knowledgeTree.clearSelectedNode();
		nodeDetailsStaticOverlayer.hideExtraContent();
		
		if(nodeType == "root") {
			const ID = nodeObj.getID();
			const hideDelaySec = 0;
			knowledgeTree.hideLeafNodes(ID, hideDelaySec);
			console.log("deselected root node");
		} else if (nodeType == "citedby") {
			console.log("deselected citedby");
		}
	}
	function showRootNodeEssentialContent(nodeObj) {
		showEssentialContentForNode(nodeObj);
		knowledgeTree.showLeafNodes(nodeObj.getID());
	}
	function showCitationNodeEssentialContent(nodeObj) {
		const rootNodeID = nodeObj.getRootNodeID();
		showEssentialContentForNode(nodeObj);
		knowledgeTree.showLeafNodes(rootNodeID);
	}
	function showReferenceNodeEssentialContent(nodeObj) {
		console.log("show reference node essential content");
	}
	function hideRootNodeEssentialContent(nodeObj) {
		knowledgeTree.hideLeafNodes(nodeObj.getID(), LEAF_NODE_HIDE_DURATION_SEC);
		nodeDetailsStaticOverlayer.hideEssential();
	}
	function hideCitationNodeEssentialContent(nodeObj) {
		const rootNodeId = nodeObj.getRootNodeID();
		nodeDetailsStaticOverlayer.hideEssential();
		knowledgeTree.hideLeafNodes(rootNodeId, LEAF_NODE_HIDE_DURATION_SEC);
	}
	function hideReferenceNodeEssentialContent(nodeObj) {
		console.log("hide reference node essential content");
	}
	function searchBarElementDragStarted(searchElementIndex) {
		searchPanel.setColorOfSearchResultElement(searchElementIndex, "yellow");
	}
	function searchBarElementDragFinished(isTargetPointsKnowledgeTree, cursorX ,cursorY) {
		if(isTargetPointsKnowledgeTree) {
			searchPanel.setColorOfSearchResultElement(DRAGGED_SEARCH_ELEMENT_TAG_NO, "green");

			const pos = knowledgeTree.getAbsolutePositionOfGivenPos(cursorX, cursorY);
			
			const elementPositionInSearchData = parseInt(DRAGGED_SEARCH_ELEMENT_TAG_NO);
			var fullMetadata = lastAcademicSearchDataList[elementPositionInSearchData].getFullMetadata();

			createNewRootNodeOnKnowledgeTree(CURRENT_SEARCH_PLATFORM, fullMetadata, pos.x, pos.y);
		} else {
			searchPanel.setColorOfSearchResultElement(DRAGGED_SEARCH_ELEMENT_TAG_NO, "");
		}
	}
	var lastAcademicSearchDataList = [];
	function searchRequestReceivedCallback(userInput) {
		searchPanel.clearResults();
		performSearch(CURRENT_SEARCH_PLATFORM, userInput, function(err, result){
			if(result && result.length > 0) {
				lastAcademicSearchDataList = [];
				var i = 0;
				console.log(result[0]);
				result.forEach(function(element){
					if(CURRENT_SEARCH_PLATFORM == AVAILABLE_SEARCH_PLATFORMS.GOOGLE) {
						const academicDataEntry = new GoogleScholarData(element);
						lastAcademicSearchDataList[i] = academicDataEntry;
						const googleEssential = academicDataEntry.getSearchBarEssential();
						searchPanel.addResultElement(i, googleEssential.title, googleEssential.citationCount, googleEssential.year, googleEssential.abstract, searchResultMouseEnterCallback, searchResultMouseLeaveCallback);
					} else if (CURRENT_SEARCH_PLATFORM == AVAILABLE_SEARCH_PLATFORMS.ARXIV) {
						const academicDataEntry = new ArxivData(element);
						lastAcademicSearchDataList[i] = academicDataEntry;
						const arxivEssential = academicDataEntry.getSearchBarEssential();
						searchPanel.addResultElement(i, arxivEssential.title, arxivEssential.arxivEssential, arxivEssential.year, arxivEssential.abstract, searchResultMouseEnterCallback, searchResultMouseLeaveCallback);
					} else {
						loggerModule.error("error", "unknown search platform.");
					}
					i++;
				});
				searchPanel.enableNextSearch();
			} else if (result && result.length == 0) {
				overlayerModule.informUser("No result is found for that search.");
				searchPanel.enableNextSearch();
			} else {
				console.log("Unable to perform search because of connectivity issues.");
				overlayerModule.informUser("Unable to perform search because of connectivity issues.");
				searchPanel.enableNextSearch();
			}
		});
	}
	function displaySearchBarExtraSection(x, y, elementTagNo) {
		const maxAbstractTextChar = 200;
		const maxAuthorCount = 5;

		var searchBarExtraData;
		if(lastAcademicSearchDataList[elementTagNo]) {
			searchBarExtraData = lastAcademicSearchDataList[elementTagNo].getSearchBarExtra();
		} else {
			searchBarExtraData = {
				abstractText: "Unavailable",
				authors: [],
				journal: "unavailable"
			}
			loggerModule.log("error", "Unknown search platform from searchbar extra display call.");
		}

		const abstractText = text_truncate(searchBarExtraData.abstract, maxAbstractTextChar);
		const authors = searchBarExtraData.authors;
		const journal = searchBarExtraData.journal;

		var authorText = "";
		authors.forEach(function(author, i){
			if(i < maxAuthorCount) {
				if(i != (authors.length-1))
					authorText += author + ", ";
				else
					authorText += author;
			} else {
				//author display limit  reached.
			}
		});
		
		overlayerModule.drawAbstractOverlay(x, y, abstractText, journal, authorText);
	}
	function hideSearchBarExtraSection() {
		overlayerModule.clearAbstractOverlay();
	}
	function rootNodeDragStart(nodeObj) {

	}
	function citationNodeDragStart(nodeObj) {

	}
	function referenceNodeDragStart(nodeObj) {

	}
	function rootNodeDragEnd(nodeObj) {

	}
	function citationNodeDragEnd(nodeObj) {
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
	}
	function referenceNodeDragEnd(nodeObj) {

	}
	function createNewRootNodeOnKnowledgeTree(platform, metadata, x, y) {
		const rootNodeRadius = 30;
		const leafNodeRadius = 15;
		if(platform == AVAILABLE_SEARCH_PLATFORMS.GOOGLE) {
			createRootNodeFromGoogleScholar(metadata, x, y, rootNodeRadius, leafNodeRadius);
		} else if (platform == AVAILABLE_SEARCH_PLATFORMS.ARXIV) {
			createRootNodeFromArxiv(metadata, x, y, rootNodeRadius, leafNodeRadius);
		} else {
			loggerModule.error("error", "unknown search platform requested.");
		}
	}
	function handleCitationNodeToRootNode() {
	}
	function handleReferenceNodeToRootNode() {
	}

//Initialization
	var knowledgeTree = null;
	var searchPanel = null;
	var trashBin = null;
	var nodeDetailsStaticOverlayer = null;

	function initializeScript() {
		ipcRestRenderer.initialize(sendRequestsTopic, listenResponsesTopic);
		overlayerModule.initializeModule(overlayDivID, upperPanelDivID, abstractDivID);

		knowledgeTree = new KnowledgeTree(konvaDivID, 1600, 1200, NODE_CONNECTIONS_CONFIG, mapClickedCallback);

		knowledgeTree.setNodeDragStartCallback(nodeDragStartCallback);
		knowledgeTree.setNodeDragEndCallback(nodeDragEndCallback);
		knowledgeTree.setNodeMouseOverCallback(nodeMouseOverCallback);
		knowledgeTree.setNodeMouseOutCallback(nodeMouseOutCallback);
		knowledgeTree.setNodeClickedCallback(nodeClickedCallback);

		searchPanel = new SearchPanel(searchPanelDivID);
		searchPanel.setSearchRequestReceivedCallback(searchRequestReceivedCallback);

		// Add trash bin object
		trashBin = new TrashBin(trashBinDivID);

		nodeDetailsStaticOverlayer = new NodeDetailsStaticOverlayer(baseDivId, nodeEssentialClassName, nodeExtraUpperClassName, nodeExtraLowerClassName);
		nodeDetailsStaticOverlayer.setViewButtonPressedCallback(viewWebButtonClicked);

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