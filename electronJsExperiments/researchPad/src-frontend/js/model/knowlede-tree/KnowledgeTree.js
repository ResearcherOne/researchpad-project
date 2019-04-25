function SiblingConnection(ID, firstNodeID, secondNodeID) {
	this.ID = ID;
	this.firstNodeID = firstNodeID;
	this.secondNodeID = secondNodeID;

	this.visualObj = visualizerModule.connectVisualObjectsByID(this.firstNodeID, this.secondNodeID);

	this.serialize = function() {
		return JSON.stringify({
			ID: this.ID,
			firstNodeID: this.firstNodeID,
			secondNodeID: this.secondNodeID
		});
	}
}

function KnowledgeTree(konvaDivID, width, height, nodeConnectionsConfig, mapClickedCallback) {
	//Config & Private Functions
	this.konvaDivID = konvaDivID;
	this.width = width;
	this.height = height;
	this.nodeConnectionsConfig = nodeConnectionsConfig;
	this.mapClickedCallback = mapClickedCallback;

	this.rootNodeApperanceTimers = {};

	this.rootNodes = {};
	this.rootNodeCount = 0;

	this.siblingConnections = {};
	this.siblingConnectionCount = 0;

	this.citedByNodes = {};
	this.referenceNodes = {};
	
	var _dragStartCallback = null;
	var _dragEndCallback = null;

	var _mouseOverCallback = null;
	var _mouseOutCallback = null;

	var _clickedCallback = null;

	var _selectedNode = null;

	const DEFAULT_ROOT_UPDATE_LEAF_NODE_REVEAL_DURATION_SEC = 1;

	var getNodeType = function(nodeObj) {
		if(nodeObj.constructor.name == "RootNode") {
			return "root";
		} else if (nodeObj.constructor.name == "ReferenceNode") {
			return "ref";
		} else if (nodeObj.constructor.name == "CitedByNode") {
			return "citedby";
		} else {
			return "unknown";
		}
	}

	var nodeDragStartCallback = function(nodeObj, visualObjID) {
		if(_dragStartCallback) {
			_dragStartCallback(getNodeType(nodeObj), nodeObj, visualObjID);
		} else {
			//callback not set.
		}

	}
	var nodeDragEndCallback = function(nodeObj, visualObjID) {
		if(_dragEndCallback) {
			_dragEndCallback(getNodeType(nodeObj), nodeObj, visualObjID);
		} else {
			//callback not set.
		}
	}

	var nodeMouseOverCallback = function(nodeObj, visualObjID) {
		if(_mouseOverCallback) {
			_mouseOverCallback(getNodeType(nodeObj), nodeObj, visualObjID);
		} else {
			//callback not set.
		}

	}
	var nodeMouseOutCallback = function(nodeObj, visualObjID) {
		if(_mouseOutCallback) {
			_mouseOutCallback(getNodeType(nodeObj), nodeObj, visualObjID);
		} else {
			//callback not set.
		}
	}
	
	var nodeClickedCallback = function(nodeObj, visualObjID) {
		if(_clickedCallback) {
			_clickedCallback(getNodeType(nodeObj), nodeObj, visualObjID);
		} else {
			//callback not set.
		}
	}
	
	var mapSerializeCallOnObj = function(obj) {
		var serializedObj = {};
		for (var elementKey in obj){
			serializedObj[elementKey] = obj[elementKey].serialize();
		}
		return serializedObj;		
	}
	
	var reconstructRootNodes = function(serializedRootNodes) {
		var reconstructedRootNodes = {}
		for (var serializedRootNodeID in serializedRootNodes){
			var rootNodeData = JSON.parse(serializedRootNodes[serializedRootNodeID]);
			reconstructedRootNodes[serializedRootNodeID] = new RootNode(rootNodeData.ID, rootNodeData.academicDataLibrary, rootNodeData.radius, rootNodeData.x, rootNodeData.y, nodeDragStartCallback, nodeDragEndCallback, nodeMouseOverCallback, nodeMouseOutCallback, nodeClickedCallback);
			reconstructedRootNodes[serializedRootNodeID].importSerializedReferences(rootNodeData.references, rootNodeData.citedByNodes, rootNodeData.referenceCount, rootNodeData.citedByCount, rootNodeData.suggestedCitedByNodeList, rootNodeData.suggestedReferenceNodeList);
			
			reconstructedRootNodes[serializedRootNodeID].siblingIDs = rootNodeData.siblingIDs;
			reconstructedRootNodes[serializedRootNodeID].siblingCount = rootNodeData.siblingCount;

			const citedByNodes = reconstructedRootNodes[serializedRootNodeID].getAllCitedByNodes();
			this.citedByNodes = {...this.citedByNodes, ...citedByNodes};

			const referenceNodes = reconstructedRootNodes[serializedRootNodeID].getAllReferenceNodes();
			this.referenceNodes = {...this.referenceNodes, ...referenceNodes};
		}
		return reconstructedRootNodes;	
	}
	
	var reconstructSiblingConnections = function(serializedSiblingConnections) {
		var reconstructedSiblingConnections = {}
		for (var siblingConnectionID in serializedSiblingConnections){
			var siblingConnectionData = JSON.parse(serializedSiblingConnections[siblingConnectionID]);
			reconstructedSiblingConnections[siblingConnectionID] = new SiblingConnection(siblingConnectionData.ID, siblingConnectionData.firstNodeID, siblingConnectionData.secondNodeID);
		}
		return reconstructedSiblingConnections;	
	}
	
	var mapClickedCallback = function(clickedObjName) {
		if(clickedObjName == "Circle") {
			this.mapClickedCallback("node");
		} else {
			this.mapClickedCallback(clickedObjName);
		}
	} 
	
	var setSiblingReference = function(self, rootID, siblingReferenceRootID, firstNodeType, secondNodeType) {
		const connectionID = "conn-"+rootID + siblingReferenceRootID;
		var connectionObj = new SiblingConnection(connectionID, rootID, siblingReferenceRootID);
		self.siblingConnections[connectionID] = connectionObj;
		self.siblingConnectionCount++;

		self.rootNodes[rootID].setSibling(siblingReferenceRootID, secondNodeType);
		self.rootNodes[siblingReferenceRootID].setSibling(rootID, firstNodeType);
	}

	var isLeafNodeExists = function(self, nodeID) {
		const isCitedByExists = self.citedByNodes[nodeID] != null;
		const isReferenceExists = self.referenceNodes[nodeID] != null;
		return (isCitedByExists || isReferenceExists);
	}

	var connectRootNodeToExistingLeafNodes = function(self, rootNodeID, leafNodeID,  radius, dragStartCallback, dragendCallback, mouseOverCallback, mouseOutCallback, clickedCallback) {
		const rootObj = self.rootNodes[rootNodeID];
		const rootVisualObj = rootObj.getVisualObj();
		const rootNodeCitedByCount = rootObj.getCitedByCount();
		const rootNodeReferenceCount = rootObj.getReferenceCount();

		if(self.citedByNodes[leafNodeID]) {
			const citedByObj = self.citedByNodes[leafNodeID];
			const citedByPosition = rootNodeCitedByCount + 1;
			citedByObj.connectRoot(rootNodeID, rootVisualObj, radius, citedByPosition, dragStartCallback, dragendCallback, mouseOverCallback, mouseOutCallback, clickedCallback);
			rootObj.connectCitedBy(leafNodeID);
		}

		if(self.referenceNodes[leafNodeID]) {
			const referenceObj = self.referenceNodes[leafNodeID];
			const referencePosition = rootNodeReferenceCount + 1;
			referenceObj.connectRoot(rootNodeID, rootVisualObj, radius, referencePosition, dragStartCallback, dragendCallback, mouseOverCallback, mouseOutCallback, clickedCallback);
			rootObj.connectReference(leafNodeID);
		}
	}

	var createCitedByObj = function(self, refID, initialAcademicDataLibrary) {
		var citedByObj = new CitedByNode(refID, initialAcademicDataLibrary);
		self.citedByNodes[refID] = citedByObj;
		return citedByObj;
	}

	var createReferenceObj = function(self, refID, initialAcademicDataLibrary) {
		var referenceObj = new ReferenceNode(refID, initialAcademicDataLibrary);
		self.referenceNodes[refID] = referenceObj;
		return referenceObj;
	}

	var suggestCitedBy = function(self, rootID, refID, suggestionPosition) {
		self.rootNodes[rootID].suggestCitedBy(refID);
		self.citedByNodes[refID].setPositionForSuggestion(rootID, suggestionPosition);
	}

	var suggestReference = function(self, rootID, refID, suggestionPosition) {
		self.rootNodes[rootID].suggestReference(refID);
		self.referenceNodes[refID].setPositionForSuggestion(rootID, suggestionPosition);
	}

	//Initialization
	visualizerModule.initializeModule(this.konvaDivID, this.width, this.height, this.nodeConnectionsConfig, mapClickedCallback);
	//Public Functions
	this.createRootNode = function (ID, initialAcademicDataLibrary, radius, x, y) {
		if(this.citedByNodes[ID]) {
			const rootNodesIdListOfLeafNode = this.citedByNodes[ID].getRootNodeIdList();
			for(var i=0; i<rootNodesIdListOfLeafNode.length; i++) {
				this.removeCitedbyFromRootNode(rootNodesIdListOfLeafNode[i], ID);
			}

			this.rootNodes[ID] = new RootNode(ID, initialAcademicDataLibrary, radius, x, y, nodeDragStartCallback, nodeDragEndCallback, nodeMouseOverCallback, nodeMouseOutCallback, nodeClickedCallback);
			this.rootNodeCount++;
			
			const firstNodeType = "reference";
			const secondNodeType = "citation";
			for(var i=0; i<rootNodesIdListOfLeafNode.length; i++) {
				setSiblingReference(this, rootNodesIdListOfLeafNode[i], ID, firstNodeType, secondNodeType);
			}

			return ID;
		} else if (this.referenceNodes[ID]) {
			const rootNodesIdListOfLeafNode = this.referenceNodes[ID].getRootNodeIdList();
			for(var i=0; i<rootNodesIdListOfLeafNode.length; i++) {
				this.removeReferenceFromRootNode(rootNodesIdListOfLeafNode[i], ID);
			}

			this.rootNodes[ID] = new RootNode(ID, initialAcademicDataLibrary, radius, x, y, nodeDragStartCallback, nodeDragEndCallback, nodeMouseOverCallback, nodeMouseOutCallback, nodeClickedCallback);
			this.rootNodeCount++;
			
			const firstNodeType = "citation";
			const secondNodeType = "reference";
			for(var i=0; i<rootNodesIdListOfLeafNode.length; i++) {
				setSiblingReference(this, rootNodesIdListOfLeafNode[i], ID, firstNodeType, secondNodeType);
			}
			return ID;
		} else {
			this.rootNodes[ID] = new RootNode(ID, initialAcademicDataLibrary, radius, x, y, nodeDragStartCallback, nodeDragEndCallback, nodeMouseOverCallback, nodeMouseOutCallback, nodeClickedCallback);
			this.rootNodeCount++;
			return ID;
		}
	}
	this.addReferenceToRootNode = function(rootID, refID, initialAcademicDataLibrary, radius) {
		const rootObj = this.rootNodes[rootID];
		const rootVisualObj = rootObj.getVisualObj();
		if(!this.isRootNodeExists(refID)) {
			if(isLeafNodeExists(this, refID)) {
				connectRootNodeToExistingLeafNodes(this, rootID, refID, radius, nodeDragStartCallback, nodeDragEndCallback, nodeMouseOverCallback, nodeMouseOutCallback, nodeClickedCallback);
			} else {
				const referenceObj = createReferenceObj(this, refID, initialAcademicDataLibrary);
				connectRootNodeToExistingLeafNodes(this, rootID, refID, radius, nodeDragStartCallback, nodeDragEndCallback, nodeMouseOverCallback, nodeMouseOutCallback, nodeClickedCallback);
				//referenceObj.connectRoot(rootID, rootVisualObj);
				//rootObj.connectReference(refID);

				const suggestedReferenceCount = this.rootNodes[rootID].getSuggestedReferenceCount();
				if(suggestedReferenceCount < 10) {
					const suggestionPos = suggestedReferenceCount;
					suggestReference(this, rootID, refID, suggestionPos);
				}	
			}
		} else {
			//this reference already exists as a root node, we should connect those root nodes!
			const firstNodeType = "reference";
			const secondNodeType = "citation";
			setSiblingReference(this, rootID, refID, firstNodeType, secondNodeType);
		}
		return refID;
	}
	this.removeReferenceFromRootNode = function(rootID, refID) {
		const rootObj = this.rootNodes[rootID];
		const referenceObj = this.referenceNodes[refID];
		const isSuggested = rootObj.isSuggestedNode(refID);

		if(isSuggested) {
			rootObj.removeReferenceSuggestion(refID);
			this.showLeafNodes(rootID);
			this.hideLeafNodes(rootID, DEFAULT_ROOT_UPDATE_LEAF_NODE_REVEAL_DURATION_SEC);
		}
		referenceObj.removeRootConnection(rootID);
		rootObj.removeCitedByConnection(refID);

		if(referenceObj.getConnectionCount() == 0) {
			delete this.referenceNodes[refID];
		}
	}
	this.removeCitedbyFromRootNode = function(rootID, citedByID) {
		const rootObj = this.rootNodes[rootID];
		const citedByObj = this.citedByNodes[citedByID];
		const isSuggested = rootObj.isSuggestedNode(citedByID);

		if(isSuggested) {
			rootObj.removeCitedBySuggestion(citedByID);
			this.showLeafNodes(rootID);
			this.hideLeafNodes(rootID, DEFAULT_ROOT_UPDATE_LEAF_NODE_REVEAL_DURATION_SEC);
		}
		citedByObj.removeRootConnection(rootID);
		rootObj.removeCitedByConnection(citedByID);

		if(citedByObj.getConnectionCount() == 0) {
			delete this.citedByNodes[citedByID];
		}
	}
	this.addCitedbyToRootNode = function(rootID, refID, initialAcademicDataLibrary, radius) {
		const rootObj = this.rootNodes[rootID];
		const rootVisualObj = rootObj.getVisualObj();
		if(!this.isRootNodeExists(refID)) {
			if(isLeafNodeExists(this, refID)) {
				connectRootNodeToExistingLeafNodes(this, rootID, refID, radius, nodeDragStartCallback, nodeDragEndCallback, nodeMouseOverCallback, nodeMouseOutCallback, nodeClickedCallback);
			} else {
				createCitedByObj(this, refID, initialAcademicDataLibrary);
				connectRootNodeToExistingLeafNodes(this, rootID, refID, radius, nodeDragStartCallback, nodeDragEndCallback, nodeMouseOverCallback, nodeMouseOutCallback, nodeClickedCallback);
				
				const suggestedCitedByCount = this.rootNodes[rootID].getSuggestedCitedByCount();
				if(suggestedCitedByCount < 10) {
					const suggestionPos = suggestedCitedByCount;
					suggestCitedBy(this, rootID, refID, suggestionPos);
				}	
			}
		} else {
			//this reference already exists as a root node, we should connect those root nodes!
			const firstNodeType = "reference";
			const secondNodeType = "citation";
			setSiblingReference(this, rootID, refID, firstNodeType, secondNodeType);
		}
		return refID;
	}
	this.setNodeDragStartCallback = function(callback) {
		_dragStartCallback = callback;
	}
	this.setNodeDragEndCallback = function(callback) {
		_dragEndCallback = callback;
	}
	this.setNodeMouseOverCallback = function(callback) {
		_mouseOverCallback = callback;
	}
	this.setNodeMouseOutCallback = function(callback) {
		_mouseOutCallback = callback;
	}
	this.setNodeClickedCallback = function(callback) {
		_clickedCallback = callback;
	}
	this.moveCamera = function(x, y) {
		visualizerModule.moveCanvas(x, y);
	}

	this.getAbsolutePositionOfGivenPos = function(x, y) {
		const cameraPos = this.getCameraPosition();
		const absoluteMouseX = x - cameraPos.x;
		const absoluteMouseY = y - cameraPos.y;
		return {x: absoluteMouseX, y: absoluteMouseY};
	}

	this.getCameraPosition = function() {
		return {x: visualizerModule.getCanvasPos().x, y: visualizerModule.getCanvasPos().y};
	}

	this.serialize = function() {
		var serializedKnowledgeTree = {};
		serializedKnowledgeTree.rootNodes = mapSerializeCallOnObj(this.rootNodes);
		serializedKnowledgeTree.rootNodeCount = this.rootNodeCount;

		serializedKnowledgeTree.siblingConnections = mapSerializeCallOnObj(this.siblingConnections);
		serializedKnowledgeTree.siblingConnectionCount = this.siblingConnectionCount;

		serializedKnowledgeTree.citedByNodes = mapSerializeCallOnObj(this.citedByNodes);
		serializedKnowledgeTree.referenceNodes = mapSerializeCallOnObj(this.referenceNodes);
		
		return JSON.stringify(serializedKnowledgeTree);
	}
	this.importSerializedData = function(serializedKnowledgeTree) {
		/*
		var knowledgeTreeData = JSON.parse(serializedKnowledgeTree);
		this.rootNodes = reconstructRootNodes(knowledgeTreeData.rootNodes);
		this.rootNodeCount = knowledgeTreeData.rootNodeCount;

		this.siblingConnections = reconstructSiblingConnections(knowledgeTreeData.siblingConnections);
		this.siblingConnectionCount = knowledgeTreeData.siblingConnectionCount;

		this.citedByNodes = reconstructCitedByNodes(this.citedByNodes);
		this.referenceNodes = reconstructReferenceNodes(this.referenceNodes);
		*/
	}
	this.destroy = function() {
		visualizerModule.destroy();
	}
	this.showLeafNodes = function(rootNodeID){
		clearTimeout(this.rootNodeApperanceTimers[rootNodeID]);
		this.rootNodeApperanceTimers[rootNodeID] = null;

		const rootNode = this.rootNodes[rootNodeID];
		const citedByList = rootNode.getSuggestedCitedByList();
		const referenceList = rootNode.getSuggestedReferenceList();

		for(var i=0; i<citedByList.length; i++) {
			const ID = citedByList[i];
			this.citedByNodes[ID].show(rootNodeID);
		}
		for(var j=0; j<referenceList.length; j++) {
			const ID = referenceList[j];
			this.referenceNodes[ID].show(rootNodeID);
		}
		visualizerModule.updateCanvas();

	}
	this.hideLeafNodes = function(rootNodeID, hideDurationSec){
		const rootNode = this.rootNodes[rootNodeID];
		const citedByList = rootNode.getSuggestedCitedByList();
		const referenceList = rootNode.getSuggestedReferenceList();

		if(this.rootNodeApperanceTimers[rootNodeID]) {
			clearTimeout(this.rootNodeApperanceTimers[rootNodeID]);
			this.rootNodeApperanceTimers[rootNodeID] = null;
		}

		this.rootNodeApperanceTimers[rootNodeID] = setTimeout(function(self){
			for(var i=0; i<citedByList.length; i++) {
				const ID = citedByList[i];
				self.citedByNodes[ID].hide(rootNodeID);
			}
			for(var j=0; j<referenceList.length; j++) {
				const ID = referenceList[j];
				self.referenceNodes[ID].hide(rootNodeID);
			}
			visualizerModule.updateCanvas();
			self.rootNodeApperanceTimers[rootNodeID] = null;
		}, hideDurationSec * 1000, this);
	}
	this.selectNode = function(nodeObj, visualObjID) {
		_selectedNode = nodeObj;
		_selectedNode.changeStrokeColor(visualObjID, "dimgray");
		visualizerModule.updateCanvas();
	}
	this.clearSelectedNode = function(visualObjID) {
		_selectedNode.changeStrokeColor(visualObjID, "black");
		visualizerModule.updateCanvas();
		_selectedNode = null;
	}
	this.isSelectedNode = function(nodeObj) {
		if(_selectedNode) {
			const inputNodeID = nodeObj.getID();
			const selectedNodeID = _selectedNode.getID();
			return (inputNodeID == selectedNodeID);
		} else {
			return false;
		}
	}
	this.isSelectedNodeExists = function() {
		return (_selectedNode !== null);
	}
	this.getSelectedNode = function() {
		return _selectedNode;
	}
	this.addAcademicDataToRootNode = function(rootNodeID, key, value) {
		this.rootNodes[rootNodeID].addAcademicData(key, value);
	}
	this.getNodeType = getNodeType;
	this.transformCitationNodeToRootNode = function(rootNodeIdOfLeafNode, nodeIdToTransform, newNodeRadius, x , y) {
		const academicDataLibrary = this.citedByNodes[nodeIdToTransform].getAcademicDataLibrary();
		
		const rootNodesIdListOfLeafNode = this.citedByNodes[nodeIdToTransform].getRootNodeIdList();
		for(var i=0; i<rootNodesIdListOfLeafNode.length; i++) {
			this.removeCitedbyFromRootNode(rootNodesIdListOfLeafNode[i], nodeIdToTransform);
		}
		
		this.createRootNode(nodeIdToTransform, academicDataLibrary, newNodeRadius, x, y);

		const firstNodeType = "reference";
		const secondNodeType = "citation";
		for(var i=0; i<rootNodesIdListOfLeafNode.length; i++) {
			setSiblingReference(this, rootNodesIdListOfLeafNode[i], nodeIdToTransform, firstNodeType, secondNodeType);
		}
	}
	this.transformReferenceNodeToRootNode = function(rootNodeIdOfLeafNode, nodeIdToTransform, newNodeRadius, x , y) {
		const academicDataLibrary = this.referenceNodes[nodeIdToTransform].getAcademicDataLibrary();
		
		const rootNodesIdListOfLeafNode = this.referenceNodes[nodeIdToTransform].getRootNodeIdList();
		for(var i=0; i<rootNodesIdListOfLeafNode.length; i++) {
			this.removeReferenceFromRootNode(rootNodesIdListOfLeafNode[i], nodeIdToTransform);
		}

		this.createRootNode(nodeIdToTransform, academicDataLibrary, newNodeRadius, x, y);

		const firstNodeType = "citation";
		const secondNodeType = "reference";
		for(var i=0; i<rootNodesIdListOfLeafNode.length; i++) {
			setSiblingReference(this, rootNodesIdListOfLeafNode[i], nodeIdToTransform, firstNodeType, secondNodeType);
		}
	}
	this.isRootNodeExists = function(nodeID) {
		return (this.rootNodes[nodeID] != null);
	}
}