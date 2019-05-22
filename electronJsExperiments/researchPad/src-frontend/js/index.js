//Index.js Sections
	//Configurations
	//Backend Communication
	//UI Helper Functions
	//Handle UI Actions
	//User Action Helper Functions
	//Handle User Actions (Aggregated from UI Actions)
	//Initialization

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

	const baseDivId = "knowledge-tree-div";
	const nodeEssentialClassName = "node-essential-div";
	const nodeExtraUpperClassName = "node-extra-upper-div";
	const nodeExtraLowerClassName = "node-extra-lower-div";

	const NODE_CONNECTIONS_CONFIG = {
		citedByAbsoluteStartDegree: 285,
		citedByAbsoluteEndDegree: 85,
		referenceAbsoluteStartDegree: 100,
		referenceAbsoluteEndDegree: 265,
		connectionLength: 50,
		maxConnectionPerLayer: 10
	};

	const DEFAULT_ROOT_NODE_RADIUS = 30;
	const DEFAULT_LEAF_NODE_RADIUS = 15;

	const LEAF_NODE_HIDE_DURATION_SEC = 1.5;

	const AVAILABLE_SEARCH_PLATFORMS = { //This will turn into fields such as Physics, Computer Science, etc.
		GOOGLE: "Google Scholar",
		ARXIV: "Arxiv"
	};
	var CURRENT_SEARCH_PLATFORM = AVAILABLE_SEARCH_PLATFORMS.GOOGLE;

	const SEMANTIC_SCHOLAR_SEARCH_METHODS = {
		arxivId: "arxivId",
		semananticId: "semanticId"
	};

	const ACADEMIC_DATA_KEY_NAMES = {
		ARXIV: "arxiv",
		GOOGLE: "googleScholar",
		SEMANTIC_SCHOLAR: "semanticScholar"
	};

	const NODE_TYPES = {
		ROOT: "root",
		CITATION: "citedby",
		REFERENCE: "root"
	};

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
	function nodeDragStartCallback(nodeType, nodeObj, visualObjID) {
		if(nodeType == "root") {
			rootNodeDragStart(nodeObj, visualObjID);
		} else if (nodeType == "ref") {
			referenceNodeDragStart(nodeObj, visualObjID);
		} else if (nodeType == "citedby") {
			citationNodeDragStart(nodeObj, visualObjID);
		} else {
			console.log("Unknown node drag start: "+nodeType);
		}
	}
	function nodeDragEndCallback(nodeType, nodeObj, visualObjID) {
		if(nodeType == "root") {
			rootNodeDragEnd(nodeObj, visualObjID);
		} else if (nodeType == "ref") {
			referenceNodeDragEnd(nodeObj, visualObjID);
		} else if (nodeType == "citedby") {
			citationNodeDragEnd(nodeObj, visualObjID);
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
	function nodeMouseOverCallback(nodeType, nodeObj, visualObjID) {
		if(nodeDetailsStaticOverlayer.isExtraContentBeingDisplayed()) {
			//DONT SHOW ANYTHING
		} else {
			if(nodeType == "root") {
				document.body.style.cursor = 'pointer';
				showRootNodeEssentialContent(nodeObj, visualObjID);
			} else if (nodeType == "ref") {
				if(!nodeObj.isHiddenNode()) {
					showLeafNodeEssentialContent(nodeObj, visualObjID);
					document.body.style.cursor = 'pointer';
				}
			} else if (nodeType == "citedby") {
				if(!nodeObj.isHiddenNode()) {
					showLeafNodeEssentialContent(nodeObj, visualObjID);
					document.body.style.cursor = 'pointer';
				}
			} else {
				console.log("Unknown type name: "+nodeType);
			}
		}
	}
	function nodeMouseOutCallback(nodeType, nodeObj, visualObjID) {
		if(nodeDetailsStaticOverlayer.isExtraContentBeingDisplayed()) {
			//pass
		} else {
			if(nodeType == "root") {
				document.body.style.cursor = 'default';
				if(!knowledgeTree.isSelectedNode(nodeObj)){
					hideRootNodeEssentialContent(nodeObj, visualObjID);
				}
			} else if (nodeType == "ref") {
				if(!nodeObj.isHiddenNode()) {
					document.body.style.cursor = 'default';
					hideLeafNodeEssentialContent(nodeObj, visualObjID);
				}
			} else if (nodeType == "citedby") {
				if(!nodeObj.isHiddenNode()) {
					document.body.style.cursor = 'default';
					hideLeafNodeEssentialContent(nodeObj, visualObjID);
				}
			} else {
				console.log("Unknown type name: "+nodeType);
			}
		}
	}
	function nodeClickedCallback(nodeType, nodeObj, visualObjID) {
		if(nodeType == "root") {
			if(knowledgeTree.isSelectedNode(nodeObj)) {
				deselectNode(nodeType, nodeObj, visualObjID);
			} else {
				selectRootNode(nodeObj, visualObjID);
			}
		} else if (nodeType == "ref") {
			if(knowledgeTree.isSelectedNode(nodeObj)) {
				deselectNode(nodeType, nodeObj, visualObjID);
			} else {
				selectLeafNode(nodeObj, visualObjID);
			}
		} else if (nodeType == "citedby") {
			console.log("Clicked: Type of citedby");
			if(knowledgeTree.isSelectedNode(nodeObj)) {
				deselectNode(nodeType, nodeObj, visualObjID);
			} else {
				selectLeafNode(nodeObj, visualObjID);
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
	function createRootNodeWithScholarData(metadata, x, y, rootNodeRadius) {
		return nodeID;
	}
	function createRootNodeFromGoogleScholar(metadata, x ,y, rootNodeRadius, leafNodeRadius) {
		var academicMetadataObj = {};
		academicMetadataObj[ACADEMIC_DATA_KEY_NAMES.GOOGLE] = metadata;
		const scholarData = new GoogleScholarData(metadata);
		const paperTitle = scholarData.getTitle();
		const rootNodeObjectID = paperTitle.hashCode();
	
		
		if(!knowledgeTree.isRootNodeExists(rootNodeObjectID)) {
			knowledgeTree.createRootNode(rootNodeObjectID, academicMetadataObj, rootNodeRadius, x, y);
	
			getCitedByOfArticle(metadata.citedByLink, function(err, citedByList){
				if(citedByList) {
					console.log(citedByList);
					citedByList.forEach(function(citedByMetadata){
						var academicMetadataObj = {};
						academicMetadataObj[ACADEMIC_DATA_KEY_NAMES.GOOGLE] = citedByMetadata;
						const scholarData = new GoogleScholarData(citedByMetadata);
						const paperTitle = scholarData.getTitle();
						const citedByID = paperTitle.hashCode();
						knowledgeTree.addCitedbyToRootNode(rootNodeObjectID, citedByID, academicMetadataObj, leafNodeRadius);
					});
				} else {
					loggerModule.error("error", "Err cited by fetch.");
				}
			});
		} else {
			overlayerModule.informUser("This root node already exists in your tree.");
		}
	}
	function createRootNodeFromArxiv(metadata, x ,y, rootNodeRadius, leafNodeRadius) {
		//console.log("ARXIV METADATA: "+JSON.stringify(metadata));
		var academicMetadataObj = {};
		academicMetadataObj[ACADEMIC_DATA_KEY_NAMES.ARXIV] = metadata;
		const arxivDataModel = new ArxivData(metadata);
		const paperTitle = arxivDataModel.getTitle();
		const rootNodeObjectID = paperTitle.hashCode();

		if(!knowledgeTree.isRootNodeExists(rootNodeObjectID)) {
			knowledgeTree.createRootNode(rootNodeObjectID, academicMetadataObj, rootNodeRadius, x, y);
			const fetchMethod = SEMANTIC_SCHOLAR_SEARCH_METHODS.arxivId;
			const paperArxivId = arxivDataModel.getArxivId();
			fetchPaperDetailsFromSemanticScholar(fetchMethod, paperArxivId, function(err, result){
				if(result) {
					const semanticDataModel = new SemanticScholarData(result);
					const citedByList = semanticDataModel.getCitations();
					const referenceList = semanticDataModel.getReferences();
					knowledgeTree.addAcademicDataToRootNode(rootNodeObjectID, ACADEMIC_DATA_KEY_NAMES.SEMANTIC_SCHOLAR, result);
					citedByList.forEach(function(citedByMetadata){
						var academicMetadataObj = {};
						academicMetadataObj[ACADEMIC_DATA_KEY_NAMES.SEMANTIC_SCHOLAR] = citedByMetadata;
						const semanticScholarData = new SemanticScholarData(citedByMetadata);
						const paperTitle = semanticScholarData.getTitle();
						const citedByID = paperTitle.hashCode();

						knowledgeTree.addCitedbyToRootNode(rootNodeObjectID, citedByID, academicMetadataObj, leafNodeRadius);
					});

					referenceList.forEach(function(referenceMetadata){
						var academicMetadataObj = {};
						academicMetadataObj[ACADEMIC_DATA_KEY_NAMES.SEMANTIC_SCHOLAR] = referenceMetadata;
						const semanticScholarData = new SemanticScholarData(referenceMetadata);
						const paperTitle = semanticScholarData.getTitle();
						const citedByID = paperTitle.hashCode();

						knowledgeTree.addReferenceToRootNode(rootNodeObjectID, citedByID, academicMetadataObj, leafNodeRadius);
					});
				} else {
					loggerModule.error("error", "Err semantic scholar data fetch.");
				}
			});
		} else {
			overlayerModule.informUser("This root node already exists in your tree.");
		}
	}
	function showEssentialContentForNode(nodeObj, visualObjID) {
		var nodeCenter = nodeObj.getPositionOnCamera(visualObjID);
		var nodeRadius = visualizerModule.getNodeRadiusById(visualObjID);
		
		if(CURRENT_SEARCH_PLATFORM == AVAILABLE_SEARCH_PLATFORMS.GOOGLE) {
			const academicDataLibrary = nodeObj.getAcademicDataLibrary();
			const googleData = academicDataLibrary[ACADEMIC_DATA_KEY_NAMES.GOOGLE];
			const csAggregateData = new ComputerScienceAggregateModel(googleData);
			var contentData = csAggregateData.getNodeFullContentData();
			nodeDetailsStaticOverlayer.setContent(
				contentData.title,
				contentData.year,
				contentData.citationCount,
				contentData.abstract,
				contentData.journal,
				contentData.authors,
				contentData.link);
			nodeDetailsStaticOverlayer.showEssential((nodeCenter.x+(nodeRadius*1.5)), (nodeCenter.y-nodeRadius));	
		} else if (CURRENT_SEARCH_PLATFORM == AVAILABLE_SEARCH_PLATFORMS.ARXIV) {
			const academicDataLibrary = nodeObj.getAcademicDataLibrary();
			var arxivData = academicDataLibrary[ACADEMIC_DATA_KEY_NAMES.ARXIV];
			var semanticData = academicDataLibrary[ACADEMIC_DATA_KEY_NAMES.SEMANTIC_SCHOLAR];
			const physicsAggregateData = new PhysicsAggregateModel(arxivData, semanticData);
			var contentData = physicsAggregateData.getNodeFullContentData();
			nodeDetailsStaticOverlayer.setContent(
				contentData.title,
				contentData.year,
				contentData.citationCount,
				contentData.abstract,
				contentData.journal,
				contentData.authors,
				contentData.link);
			nodeDetailsStaticOverlayer.showEssential((nodeCenter.x+(nodeRadius*1.5)), (nodeCenter.y-nodeRadius));	
		} else {
			loggerModule.error("error", "unknown search platform..");
		}
	}
	function transformCitationToRootNodeForGoogleScholar(x, y, ID, rootNodeIdOfLeafNode, nodeObj) {
		const academicDataLibrary = nodeObj.getAcademicDataLibrary();
		const googleMetadataData = academicDataLibrary[ACADEMIC_DATA_KEY_NAMES.GOOGLE];
		const citedByLink = googleMetadataData.citedByLink;

		if(citedByLink) {
			knowledgeTree.transformCitationNodeToRootNode(rootNodeIdOfLeafNode, ID, DEFAULT_ROOT_NODE_RADIUS, x , y);

			getCitedByOfArticle(citedByLink, function(err, citedByList){
				if(citedByList) {
					citedByList.forEach(function(citedByMetadata){
						var academicMetadataObj = {};
						academicMetadataObj[ACADEMIC_DATA_KEY_NAMES.GOOGLE] = citedByMetadata;
						const scholarData = new GoogleScholarData(citedByMetadata);
						const paperTitle = scholarData.getTitle();
						const citedByID = paperTitle.hashCode();
						knowledgeTree.addCitedbyToRootNode(ID, citedByID, academicMetadataObj, DEFAULT_LEAF_NODE_RADIUS);
					});
				} else {
					overlayerModule.informUser("Unable to fetch citations data.");
				}
			});
		} else {
			knowledgeTree.transformCitationNodeToRootNode(rootNodeIdOfLeafNode, ID, DEFAULT_ROOT_NODE_RADIUS, x , y);
		}
	}
	function transformLeafToRootNodeForArxiv(x, y, ID, rootNodeIdOfLeafNode, nodeObj, nodeType) {
		const academicDataLibrary = nodeObj.getAcademicDataLibrary();
		const semanticData = new SemanticScholarData(academicDataLibrary[ACADEMIC_DATA_KEY_NAMES.SEMANTIC_SCHOLAR]);
		const semanticId = semanticData.getPaperId();
		const arxivData = new ArxivData(academicDataLibrary[ACADEMIC_DATA_KEY_NAMES.ARXIV]);
		const arxivId = arxivData.getArxivId();

		var fetchMethod;
		var paperId;
		if(semanticId) {
			fetchMethod = SEMANTIC_SCHOLAR_SEARCH_METHODS.semananticId;
			paperId = semanticId;
		} else if (arxivId) {
			fetchMethod = SEMANTIC_SCHOLAR_SEARCH_METHODS.arxivId;
			paperId = arxivId;
		} else {
			loggerModule.error("error", "Neither arxivId nor semanticId exists.");
			overlayerModule.informUser("Unable to fetch citations data, because this paper does not have necessary data attached to it.");
		}

		if(nodeType == NODE_TYPES.CITATION) {
			knowledgeTree.transformCitationNodeToRootNode(rootNodeIdOfLeafNode, ID, DEFAULT_ROOT_NODE_RADIUS, x , y);
		} else {
			knowledgeTree.transformReferenceNodeToRootNode(rootNodeIdOfLeafNode, ID, DEFAULT_ROOT_NODE_RADIUS, x , y);
		}
		fetchPaperDetailsFromSemanticScholar(fetchMethod, paperId, function(err, metadata){
			if(metadata) {
				const semanticDataModel = new SemanticScholarData(metadata);
				const citedByList = semanticDataModel.getCitations();
				const referenceList = semanticDataModel.getReferences();
				knowledgeTree.addAcademicDataToRootNode(ID, ACADEMIC_DATA_KEY_NAMES.SEMANTIC_SCHOLAR, metadata);
				citedByList.forEach(function(citedByMetadata){
					var academicMetadataObj = {};
					academicMetadataObj[ACADEMIC_DATA_KEY_NAMES.SEMANTIC_SCHOLAR] = citedByMetadata;
					const semanticScholarData = new SemanticScholarData(citedByMetadata);
					const paperTitle = semanticScholarData.getTitle();
					const citedByID = paperTitle.hashCode();

					knowledgeTree.addCitedbyToRootNode(ID, citedByID, academicMetadataObj, DEFAULT_LEAF_NODE_RADIUS);
				});

				referenceList.forEach(function(referenceMetadata){
					var academicMetadataObj = {};
					academicMetadataObj[ACADEMIC_DATA_KEY_NAMES.SEMANTIC_SCHOLAR] = referenceMetadata;
					const semanticScholarData = new SemanticScholarData(referenceMetadata);
					const paperTitle = semanticScholarData.getTitle();
					const refID = paperTitle.hashCode();

					knowledgeTree.addReferenceToRootNode(ID, refID, academicMetadataObj, DEFAULT_LEAF_NODE_RADIUS);
				});
			} else {
				loggerModule.error("error", "Err semantic scholar data fetch.");
			}
		});
	}

//Handle User Actions (Aggregated from UI Actions)
	function selectRootNode(nodeObj, visualObjID) {
		if(knowledgeTree.isSelectedNodeExists()) {
			knowledgeTree.clearSelectedNode();
		}

		const nodeObjID = nodeObj.getID();
		knowledgeTree.selectNode(nodeObj, visualObjID);
		knowledgeTree.showLeafNodes(nodeObjID);
		showEssentialContentForNode(nodeObj, visualObjID);
		const isUpperContentShown = true;
		nodeDetailsStaticOverlayer.showExtraContent(isUpperContentShown);
		console.log("selected root node");
	}
	function selectLeafNode(nodeObj, visualObjID) {
		if(knowledgeTree.isSelectedNodeExists()) {
			knowledgeTree.clearSelectedNode();
		}
		knowledgeTree.selectNode(nodeObj, visualObjID);
		showEssentialContentForNode(nodeObj, visualObjID);
		const isUpperContentShown = false;
		nodeDetailsStaticOverlayer.showExtraContent(isUpperContentShown);
	}
	function deselectNode(nodeType, nodeObj, visualObjID) {
		knowledgeTree.clearSelectedNode(visualObjID);
		nodeDetailsStaticOverlayer.hideExtraContent();
		
		if(nodeType == "root") {
			const ID = nodeObj.getID();
			const hideDelaySec = 0;
			knowledgeTree.hideLeafNodes(ID, hideDelaySec);
			console.log("deselected root node");
		} else if (nodeType == "citedby" || nodeType == "ref") {
			console.log("deselected leaf");
		}
	}
	function showRootNodeEssentialContent(nodeObj, visualObjID) {
		showEssentialContentForNode(nodeObj, visualObjID);
		knowledgeTree.showLeafNodes(nodeObj.getID());
	}
	function showLeafNodeEssentialContent(nodeObj, visualObjID) {
		const rootNodeID = nodeObj.getRootNodeID(visualObjID);
		showEssentialContentForNode(nodeObj, visualObjID);
		knowledgeTree.showLeafNodes(rootNodeID);
	}
	function showReferenceNodeEssentialContent(nodeObj) {
		console.log("show reference node essential content");
	}
	function hideRootNodeEssentialContent(nodeObj, visualObjID) {
		knowledgeTree.hideLeafNodes(nodeObj.getID(), LEAF_NODE_HIDE_DURATION_SEC);
		nodeDetailsStaticOverlayer.hideEssential();
	}
	function hideLeafNodeEssentialContent(nodeObj, visualObjID) {
		const rootNodeId = nodeObj.getRootNodeID(visualObjID);
		nodeDetailsStaticOverlayer.hideEssential();
		knowledgeTree.hideLeafNodes(rootNodeId, LEAF_NODE_HIDE_DURATION_SEC);
	}
	function searchBarElementDragStarted(searchElementIndex) {
		const elementPositionInSearchData = parseInt(DRAGGED_SEARCH_ELEMENT_TAG_NO);
		var aggregateModelData = lastAcademicSearchDataList[elementPositionInSearchData];
		const title = aggregateModelData.getTitle();
		const rootID = title.hashCode();
		const isRootAlreadyExists = knowledgeTree.isRootNodeExists(rootID);
		if(!isRootAlreadyExists) {
			searchPanel.setColorOfSearchResultElement(searchElementIndex, "yellow");
		}
	}
	function searchBarElementDragFinished(isTargetPointsKnowledgeTree, cursorX ,cursorY) {
		if(isTargetPointsKnowledgeTree) {
			searchPanel.setColorOfSearchResultElement(DRAGGED_SEARCH_ELEMENT_TAG_NO, "green");

			const pos = knowledgeTree.getAbsolutePositionOfGivenPos(cursorX, cursorY);
			
			const elementPositionInSearchData = parseInt(DRAGGED_SEARCH_ELEMENT_TAG_NO);
			var aggregateModelData = lastAcademicSearchDataList[elementPositionInSearchData];

			createNewRootNodeOnKnowledgeTreeViaSearchOperation(CURRENT_SEARCH_PLATFORM, aggregateModelData, pos.x, pos.y);
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
				result.forEach(function(searchElementMetadata){
					if(CURRENT_SEARCH_PLATFORM == AVAILABLE_SEARCH_PLATFORMS.GOOGLE) {
						const academicDataEntry = new ComputerScienceAggregateModel(searchElementMetadata);
						lastAcademicSearchDataList[i] = academicDataEntry;
						const googleEssential = academicDataEntry.getSearchBarEssential();
						const isRootNodeExists = knowledgeTree.isRootNodeExists(googleEssential.title.hashCode());
						searchPanel.addResultElement(i, googleEssential.title, googleEssential.citationCount, googleEssential.year, googleEssential.abstract, searchResultMouseEnterCallback, searchResultMouseLeaveCallback);
						if(isRootNodeExists) searchPanel.setColorOfSearchResultElement(i, "green");
					} else if (CURRENT_SEARCH_PLATFORM == AVAILABLE_SEARCH_PLATFORMS.ARXIV) {
						const academicDataEntry = new PhysicsAggregateModel(searchElementMetadata);
						lastAcademicSearchDataList[i] = academicDataEntry;
						const arxivEssential = academicDataEntry.getSearchBarEssential();
						const isRootNodeExists = knowledgeTree.isRootNodeExists(arxivEssential.title.hashCode());
						searchPanel.addResultElement(i, arxivEssential.title, arxivEssential.arxivEssential, arxivEssential.year, arxivEssential.abstract, searchResultMouseEnterCallback, searchResultMouseLeaveCallback);
						if(isRootNodeExists) searchPanel.setColorOfSearchResultElement(i, "green");
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
	function rootNodeDragStart(nodeObj, visualObjID) {

	}
	function citationNodeDragStart(nodeObj, visualObjID) {

	}
	function referenceNodeDragStart(nodeObj, visualObjID) {

	}
	function rootNodeDragEnd(nodeObj, visualObjID) {

	}
	function citationNodeDragEnd(nodeObj, visualObjID) {
		const x = nodeObj.getAbsolutePosition(visualObjID).x;
		const y = nodeObj.getAbsolutePosition(visualObjID).y;
		const ID = nodeObj.getID();
		const rootNodeIdOfLeafNode = nodeObj.getRootNodeID(visualObjID);

		transformCitationNodeToRootNode(CURRENT_SEARCH_PLATFORM, x, y, ID, rootNodeIdOfLeafNode, nodeObj);
	}
	function referenceNodeDragEnd(nodeObj, visualObjID) {
		const x = nodeObj.getAbsolutePosition(visualObjID).x;
		const y = nodeObj.getAbsolutePosition(visualObjID).y;
		const ID = nodeObj.getID();
		const rootNodeIdOfLeafNode = nodeObj.getRootNodeID(visualObjID);

		transformReferenceNodeToRootNode(CURRENT_SEARCH_PLATFORM, x, y, ID, rootNodeIdOfLeafNode, nodeObj);
	}
	function createNewRootNodeOnKnowledgeTreeViaSearchOperation(platform, aggregateModelData, x, y) {
		if(platform == AVAILABLE_SEARCH_PLATFORMS.GOOGLE) {
			var metadata = aggregateModelData.getFullMetadata();
			createRootNodeFromGoogleScholar(metadata, x, y, DEFAULT_ROOT_NODE_RADIUS, DEFAULT_LEAF_NODE_RADIUS);
		} else if (platform == AVAILABLE_SEARCH_PLATFORMS.ARXIV) {
			var metadata = aggregateModelData.getArxivMetadata();
			createRootNodeFromArxiv(metadata, x, y, DEFAULT_ROOT_NODE_RADIUS, DEFAULT_LEAF_NODE_RADIUS);
		} else {
			loggerModule.error("error", "unknown search platform requested.");
		}
	}
	function transformCitationNodeToRootNode(platform, x, y, ID, rootNodeIdOfLeafNode, nodeObj) {
		if(platform == AVAILABLE_SEARCH_PLATFORMS.GOOGLE) {
			transformCitationToRootNodeForGoogleScholar(x, y, ID, rootNodeIdOfLeafNode, nodeObj);
		} else if (platform == AVAILABLE_SEARCH_PLATFORMS.ARXIV) {
			const nodeType = NODE_TYPES.CITATION;
			transformLeafToRootNodeForArxiv(x, y, ID, rootNodeIdOfLeafNode, nodeObj, nodeType);
		} else {
			loggerModule.error("error", "unknown search platform requested.");
		}
	}
	function transformReferenceNodeToRootNode(platform, x, y, ID, rootNodeIdOfLeafNode, nodeObj) {
		if(platform == AVAILABLE_SEARCH_PLATFORMS.GOOGLE) {
			//transformCitationToRootNodeForGoogleScholar(x, y, ID, rootNodeIdOfLeafNode, nodeObj);
		} else if (platform == AVAILABLE_SEARCH_PLATFORMS.ARXIV) {
			const nodeType = NODE_TYPES.REFERENCE;
			transformLeafToRootNodeForArxiv(x, y, ID, rootNodeIdOfLeafNode, nodeObj, nodeType);
		} else {
			loggerModule.error("error", "unknown search platform requested.");
		}
	}

//Initialization
	var knowledgeTree = null;
	var searchPanel = null;
	var nodeDetailsStaticOverlayer = null;

	function initializeKnowledeTree() {
		knowledgeTree = new KnowledgeTree(konvaDivID, 1600, 1200, NODE_CONNECTIONS_CONFIG, mapClickedCallback, DEFAULT_LEAF_NODE_RADIUS);
	
		knowledgeTree.setNodeDragStartCallback(nodeDragStartCallback);
		knowledgeTree.setNodeDragEndCallback(nodeDragEndCallback);
		knowledgeTree.setNodeMouseOverCallback(nodeMouseOverCallback);
		knowledgeTree.setNodeMouseOutCallback(nodeMouseOutCallback);
		knowledgeTree.setNodeClickedCallback(nodeClickedCallback);
	}

	function initializeScript() {
		ipcRestRenderer.initialize(sendRequestsTopic, listenResponsesTopic);
		overlayerModule.initializeModule(overlayDivID, upperPanelDivID, abstractDivID);

		initializeKnowledeTree();

		searchPanel = new SearchPanel(searchPanelDivID);
		searchPanel.setSearchRequestReceivedCallback(searchRequestReceivedCallback);
		searchPanel.setSearchPanelTitle(CURRENT_SEARCH_PLATFORM);
		
		nodeDetailsStaticOverlayer = new NodeDetailsStaticOverlayer(baseDivId, nodeEssentialClassName, nodeExtraUpperClassName, nodeExtraLowerClassName);
		nodeDetailsStaticOverlayer.setViewButtonPressedCallback(viewWebButtonClicked);

		getHostname(function(err, hostname){
			loggerModule.initialize(hostname);
			loggerModule.log("action", "userlogin", {"username": hostname});
		});
		
		const loadedKnowledgeTreeData = localStorage.getItem("knowledgeTree");
		if(loadedKnowledgeTreeData) {
			//knowledgeTree.importSerializedData(loadedKnowledgeTreeData);
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
			const serializedKnowledgeTree = knowledgeTree.serialize();
			localStorage.setItem("knowledgeTree", serializedKnowledgeTree);
			overlayerModule.informUser("Your Knowledge Tree is saved.");
			loggerModule.log("action", "save button clicked");
		});

		document.getElementById("reset-button").addEventListener("click", function(event){
			event.preventDefault();
			localStorage.removeItem("knowledgeTree");
			
			knowledgeTree.destroy();			
			initializeKnowledeTree();

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
