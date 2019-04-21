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

	this.rootNodes = {};
	this.rootNodeCount = 0;

	this.siblingConnections = {};
	this.siblingConnectionCount = 0;

	this.citedByNodes = {};
	this.referenceNodes = {};
	
	var dragStartCallback = null;
	var dragEndCallback = null;

	var mouseOverCallback = null;
	var mouseOutCallback = null;

	var clickedCallback = null;

	var selectedNode = null;

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
		if(dragStartCallback) {
			dragStartCallback(getNodeType(nodeObj), nodeObj, visualObjID);
		} else {
			//callback not set.
		}

	}
	var nodeDragEndCallback = function(nodeObj, visualObjID) {
		if(dragEndCallback) {
			dragEndCallback(getNodeType(nodeObj), nodeObj, visualObjID);
		} else {
			//callback not set.
		}
	}

	var nodeMouseOverCallback = function(nodeObj, visualObjID) {
		if(mouseOverCallback) {
			mouseOverCallback(getNodeType(nodeObj), nodeObj, visualObjID);
		} else {
			//callback not set.
		}

	}
	var nodeMouseOutCallback = function(nodeObj, visualObjID) {
		if(mouseOutCallback) {
			mouseOutCallback(getNodeType(nodeObj), nodeObj, visualObjID);
		} else {
			//callback not set.
		}
	}
	
	var nodeClickedCallback = function(nodeObj, visualObjID) {
		if(clickedCallback) {
			clickedCallback(getNodeType(nodeObj), nodeObj, visualObjID);
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
	
	var isSelectedNode = function(ID) {
		if(selectedNodes[ID]) {
			return true;
		} else {
			return false;
		}
	}
	
	var setSiblingReference = function(rootID, siblingReferenceRootID, firstNodeType, secondNodeType, thisContext) {
		const connectionID = "conn-"+rootID + siblingReferenceRootID;
		var connectionObj = new SiblingConnection(connectionID, rootID, siblingReferenceRootID);
		thisContext.siblingConnections[connectionID] = connectionObj;
		thisContext.siblingConnectionCount++;

		thisContext.rootNodes[rootID].setSibling(siblingReferenceRootID, secondNodeType);
		thisContext.rootNodes[siblingReferenceRootID].setSibling(rootID, firstNodeType);
	}

	var isLeafNodeExists = function(nodeID) {
		const isCitedByExists = this.citedByNodes[nodeID] != null;
		const isReferenceExists = this.referenceNodes[nodeID] != null;
		return (isCitedByExists || isReferenceExists);
	}

	var connectRootNodeToExistingLeafNodes = function(rootNodeID, leafNodeID,  radius, dragendCallback, mouseOverCallback, mouseOutCallback, clickedCallback) {
		/*
			const rootNodeCitedByCount = rootObj.getCitedByCount();
			const newCitedByPosition = rootNodeCitedByCount+1;
			citedByObj.connectRoot(rootID, rootVisualObj, radius, newCitedByPosition, nodeDragEndCallback, nodeMouseOverCallback, nodeMouseOutCallback, nodeClickedCallback);
			rootObj.connectCitedBy(refID);
		*/
		const rootObj = this.rootNodes[rootNodeID];
		const rootVisualObj = rootObj.getVisualObj();

		if(this.citedByNodes[leafNodeID]) {
			const citedByObj = this.citedByNodes[leafNodeID];
			citedByObj.connectRoot(rootID, rootVisualObj);
			rootObj.connectCitedBy(leafNodeID);
		}

		if(this.referenceNodes[leafNodeID]) {
			const referenceObj = this.referenceNodes[leafNodeID];
			referenceObj.connectRoot(rootID, rootVisualObj);
			rootObj.connectCitedBy(leafNodeID);
		}
	}

	var createCitedByObj = function(refID, initialAcademicDataLibrary, radius) {

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
				setSiblingReference(rootNodesIdListOfLeafNode[i], ID, firstNodeType, secondNodeType, this);
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
				setSiblingReference(rootNodesIdListOfLeafNode[i], ID, firstNodeType, secondNodeType, this);
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
			if(isLeafNodeExists(refID)) {
				connectRootNodeToExistingLeafNodes(rootNodeID, leafNodeID);
			} else {
				const referenceObj = createReferenceObj(refID, initialAcademicDataLibrary, radius);
				referenceObj.connectRoot(rootID, rootVisualObj);
				rootObj.connectReference(refID);

				const suggestedReferenceCount = this.rootNodes[rootID].getSuggestedReferenceCount();
				if(suggestedReferenceCount < 10) {
					suggestReference(rootID, refID);
				}	
			}
		} else {
			//this reference already exists as a root node, we should connect those root nodes!
			const firstNodeType = "reference";
			const secondNodeType = "citation";
			setSiblingReference(rootID, refID, firstNodeType, secondNodeType, this);
		}
		return refID;
	}
	this.removeReferenceFromRootNode = function(rootID, refID) {
		const isSuggested = this.rootNodes[rootID].isSuggestedNode(refID);
		if(isSuggested) {
			this.rootNodes[rootID].removeReferenceSuggestion(refID);
		}
		delete this.referenceNodes[refID];
		this.rootNodes[rootID].removeReference(refID);
	}
	this.removeCitedbyFromRootNode = function(rootID, citedByID) {
		const rootObj = this.rootNodes[rootID];
		const citedByObj = this.citedByNodes[citedByID];
		const isSuggested = rootObj.isSuggestedNode(citedByID);

		if(isSuggested) {
			rootObj.removeCitedBySuggestion(citedByID);
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
			if(isLeafNodeExists(refID)) {
				connectRootNodeToExistingLeafNodes(rootNodeID, leafNodeID, radius, nodeDragEndCallback, nodeMouseOverCallback, nodeMouseOutCallback, nodeClickedCallback);
			} else {
				createCitedByObj(refID, initialAcademicDataLibrary, radius);
				connectRootNodeToExistingLeafNodes(rootNodeID, leafNodeID, radius, nodeDragEndCallback, nodeMouseOverCallback, nodeMouseOutCallback, nodeClickedCallback);
				
				const suggestedCitedByCount = this.rootNodes[rootID].getSuggestedCitedByCount();
				if(suggestedCitedByCount < 10) {
					suggestCitedBy(rootID, refID);
				}	
			}
		} else {
			//this reference already exists as a root node, we should connect those root nodes!
			const firstNodeType = "reference";
			const secondNodeType = "citation";
			setSiblingReference(rootID, refID, firstNodeType, secondNodeType, this);
		}
		return refID;
	}
	this.setNodeDragStartCallback = function(callback) {
		dragStartCallback = callback;
	}
	this.setNodeDragEndCallback = function(callback) {
		dragEndCallback = callback;
	}
	this.setNodeMouseOverCallback = function(callback) {
		mouseOverCallback = callback;
	}
	this.setNodeMouseOutCallback = function(callback) {
		mouseOutCallback = callback;
	}
	this.setNodeClickedCallback = function(callback) {
		clickedCallback = callback;
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
		var knowledgeTreeData = JSON.parse(serializedKnowledgeTree);
		this.rootNodes = reconstructRootNodes(knowledgeTreeData.rootNodes);
		this.rootNodeCount = knowledgeTreeData.rootNodeCount;

		this.siblingConnections = reconstructSiblingConnections(knowledgeTreeData.siblingConnections);
		this.siblingConnectionCount = knowledgeTreeData.siblingConnectionCount;

		this.citedByNodes = reconstructCitedByNodes(this.citedByNodes);
		this.referenceNodes = reconstructReferenceNodes(this.referenceNodes);

	}
	this.destroy = function() {
		visualizerModule.destroy();
	}
	this.showLeafNodes = function(rootNodeID){
		this.rootNodes[rootNodeID].showLeafNodes();
		visualizerModule.updateCanvas();
	}
	this.hideLeafNodes = function(rootNodeID, hideDurationSec){
		this.rootNodes[rootNodeID].hideLeafNodes(hideDurationSec);
		visualizerModule.updateCanvas();
	}
	this.selectNode = function(nodeObj, visualObjID) {
		selectedNode = nodeObj;
		selectedNode.changeStrokeColor(visualObjID, "dimgray");
		visualizerModule.updateCanvas();
	}
	this.clearSelectedNode = function(visualObjID) {
		selectedNode.changeStrokeColor(visualObjID, "black");
		visualizerModule.updateCanvas();
		selectedNode = null;
	}
	this.isSelectedNode = function(nodeObj) {
		if(selectedNode) {
			const inputNodeID = nodeObj.getID();
			const selectedNodeID = selectedNode.getID();
			return (inputNodeID == selectedNodeID);
		} else {
			return false;
		}
	}
	this.isSelectedNodeExists = function() {
		return (selectedNode !== null);
	}
	this.getSelectedNode = function() {
		return selectedNode;
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
			setSiblingReference(rootNodesIdListOfLeafNode[i], nodeIdToTransform, firstNodeType, secondNodeType, this);
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
			setSiblingReference(rootNodesIdListOfLeafNode[i], nodeIdToTransform, firstNodeType, secondNodeType, this);
		}
	}
	this.isRootNodeExists = function(nodeID) {
		return (this.rootNodes[nodeID] != null);
	}
}