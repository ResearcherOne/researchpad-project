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
		const connectionID = rootID + siblingReferenceRootID;
		var connectionObj = new SiblingConnection(connectionID, rootID, siblingReferenceRootID);
		thisContext.siblingConnections[connectionID] = connectionObj;
		thisContext.siblingConnectionCount++;

		thisContext.rootNodes[rootID].setSibling(siblingReferenceRootID, secondNodeType);
		thisContext.rootNodes[siblingReferenceRootID].setSibling(rootID, firstNodeType);
	}

	//Initialization
	visualizerModule.initializeModule(this.konvaDivID, this.width, this.height, this.nodeConnectionsConfig, mapClickedCallback);
	//Public Functions
	this.createRootNode = function (ID, initialAcademicDataLibrary, radius, x, y) {
		if(this.citedByNodes[ID]) {
			const rootNodeIdOfLeafNode = this.citedByNodes[ID].getRootNodeID();
			this.removeCitedbyFromRootNode(rootNodeIdOfLeafNode, ID);

			this.rootNodes[ID] = new RootNode(ID, initialAcademicDataLibrary, radius, x, y, nodeDragStartCallback, nodeDragEndCallback, nodeMouseOverCallback, nodeMouseOutCallback, nodeClickedCallback);
			this.rootNodeCount++;
			
			const firstNodeType = "reference";
			const secondNodeType = "citation";
			setSiblingReference(rootNodeIdOfLeafNode, ID, firstNodeType, secondNodeType, this);
			return ID;
		} else if (this.referenceNodes[ID]) {
			const rootNodeIdOfLeafNode= this.referenceNodes[ID].getRootNodeID();
			this.removeReferenceFromRootNode(rootNodeIdOfLeafNode, ID);

			this.rootNodes[ID] = new RootNode(ID, initialAcademicDataLibrary, radius, x, y, nodeDragStartCallback, nodeDragEndCallback, nodeMouseOverCallback, nodeMouseOutCallback, nodeClickedCallback);
			this.rootNodeCount++;
			
			const firstNodeType = "citation";
			const secondNodeType = "reference";
			setSiblingReference(rootNodeIdOfLeafNode, ID, firstNodeType, secondNodeType, this);
			return ID;
		} else {
			this.rootNodes[ID] = new RootNode(ID, initialAcademicDataLibrary, radius, x, y, nodeDragStartCallback, nodeDragEndCallback, nodeMouseOverCallback, nodeMouseOutCallback, nodeClickedCallback);
			this.rootNodeCount++;
			return ID;
		}
	}
	this.addReferenceToRootNode = function(rootID, refID, initialAcademicDataLibrary, radius) {
		if(!this.isRootNodeExists(refID)) {
			const suggestedReferenceCount = this.rootNodes[rootID].getSuggestedReferenceCount();
			this.rootNodes[rootID].createReference(refID, initialAcademicDataLibrary, radius);
			this.referenceNodes[refID] = this.rootNodes[rootID].getLeafNode(refID);
			
			if(suggestedReferenceCount < 10) {
				this.rootNodes[rootID].suggestReference(refID);
			}
		} else {
			//this reference already exists as a root node, we should connect those root nodes!
			const firstNodeType = "citation";
			const secondNodeType = "reference";
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
		const isSuggested = this.rootNodes[rootID].isSuggestedNode(citedByID);
		if(isSuggested) {
			this.rootNodes[rootID].removeCitedBySuggestion(citedByID);
		}
		delete this.citedByNodes[citedByID];
		this.rootNodes[rootID].removeCitedBy(citedByID);
	}
	this.addCitedbyToRootNode = function(rootID, refID, initialAcademicDataLibrary, radius) {
		if(!this.isRootNodeExists(refID)) {
			const suggestedCitedByCount = this.rootNodes[rootID].getSuggestedCitedByCount();
			//this.rootNodes[rootID].createCitedBy(refID, initialAcademicDataLibrary, radius);
			if(suggestedCitedByCount < 10) {
				this.rootNodes[rootID].createCitedBy(refID, initialAcademicDataLibrary, radius);
				this.rootNodes[rootID].suggestCitedBy(refID);
				this.citedByNodes[refID] = this.rootNodes[rootID].getLeafNode(refID);
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

		return JSON.stringify(serializedKnowledgeTree);
	}
	this.importSerializedData = function(serializedKnowledgeTree) {
		var knowledgeTreeData = JSON.parse(serializedKnowledgeTree);
		this.rootNodes = reconstructRootNodes(knowledgeTreeData.rootNodes);
		this.rootNodeCount = knowledgeTreeData.rootNodeCount;

		this.siblingConnections = reconstructSiblingConnections(knowledgeTreeData.siblingConnections);
		this.siblingConnectionCount = knowledgeTreeData.siblingConnectionCount;
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
		this.removeCitedbyFromRootNode(rootNodeIdOfLeafNode, nodeIdToTransform);
		this.createRootNode(nodeIdToTransform, academicDataLibrary, newNodeRadius, x, y);

		const firstNodeType = "reference";
		const secondNodeType = "citation";
		setSiblingReference(rootNodeIdOfLeafNode, nodeIdToTransform, firstNodeType, secondNodeType, this);
	}
	this.transformReferenceNodeToRootNode = function(rootNodeIdOfLeafNode, nodeIdToTransform, newNodeRadius, x , y) {
		const academicDataLibrary = this.referenceNodes[nodeIdToTransform].getAcademicDataLibrary();
		this.removeReferenceFromRootNode(rootNodeIdOfLeafNode, nodeIdToTransform);
		this.createRootNode(nodeIdToTransform, academicDataLibrary, newNodeRadius, x, y);

		const firstNodeType = "citation";
		const secondNodeType = "reference";
		setSiblingReference(rootNodeIdOfLeafNode, nodeIdToTransform, firstNodeType, secondNodeType, this);
	}
	this.isRootNodeExists = function(nodeID) {
		return (this.rootNodes[nodeID] != null);
	}
}