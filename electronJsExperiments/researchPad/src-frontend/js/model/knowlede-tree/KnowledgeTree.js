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

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

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
	
	var dragStartCallback = null;
	var dragEndCallback = null;

	var mouseOverCallback = null;
	var mouseOutCallback = null;

	var clickedCallback = null;

	//var selectedNodes = {};
	//var leafNodesLockedRootNodes = {};
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

	var nodeDragStartCallback = function(nodeObj) {
		if(dragStartCallback) {
			dragStartCallback(getNodeType(nodeObj), nodeObj);
		} else {
			//callback not set.
		}

	}
	var nodeDragEndCallback = function(nodeObj) {
		if(dragEndCallback) {
			dragEndCallback(getNodeType(nodeObj), nodeObj);
		} else {
			//callback not set.
		}
	}

	var nodeMouseOverCallback = function(nodeObj) {
		if(mouseOverCallback) {
			mouseOverCallback(getNodeType(nodeObj), nodeObj);
		} else {
			//callback not set.
		}

	}
	var nodeMouseOutCallback = function(nodeObj) {
		if(mouseOutCallback) {
			mouseOutCallback(getNodeType(nodeObj), nodeObj);
		} else {
			//callback not set.
		}
	}

	var nodeClickedCallback = function(nodeObj) {
		if(clickedCallback) {
			clickedCallback(getNodeType(nodeObj), nodeObj);
		} else {
			//callback not set.
		}
	}

	var getRandomInt = function(max) {
		return Math.floor(Math.random() * Math.floor(max));
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
			reconstructedRootNodes[serializedRootNodeID].importSerializedReferences(rootNodeData.references, rootNodeData.citedByNodes, rootNodeData.referenceCount, rootNodeData.citedByCount);
			
			reconstructedRootNodes[serializedRootNodeID].siblingIDs = rootNodeData.siblingIDs;
			reconstructedRootNodes[serializedRootNodeID].siblingCount = rootNodeData.siblingCount;

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

	//Initialization
	visualizerModule.initializeModule(this.konvaDivID, this.width, this.height, this.nodeConnectionsConfig, mapClickedCallback);
	//Public Functions
	this.createRootNode = function (initialAcademicDataLibrary, radius, x, y) {
		const ID = ("root-"+getRandomInt(99999)).hashCode();
		this.rootNodes[ID] = new RootNode(ID, initialAcademicDataLibrary, radius, x, y, nodeDragStartCallback, nodeDragEndCallback, nodeMouseOverCallback, nodeMouseOutCallback, nodeClickedCallback);
		this.rootNodeCount++;
		return ID;
	}
	this.addReferenceToRootNode = function(rootID, initialAcademicDataLibrary, radius) {
		const refID = ("ref-"+getRandomInt(99999)).hashCode();
		this.rootNodes[rootID].createReference(refID, initialAcademicDataLibrary, radius);
		return refID;
	}
	this.removeReferenceFromRootNode = function(rootID, refID) {
		this.rootNodes[rootID].removeReference(refID);
	}
	this.removeCitedbyFromRootNode = function(rootID, citedByID) {
		this.rootNodes[rootID].removeCitedBy(citedByID);
	}
	this.addCitedbyToRootNode = function(rootID, initialAcademicDataLibrary, radius) {
		const refID = ("ref-"+getRandomInt(99999)).hashCode();
		this.rootNodes[rootID].createCitedBy(refID, initialAcademicDataLibrary, radius);
		return refID;
	}
	this.setSiblingReference = function(rootID, siblingReferenceRootID) {
		const connectionID = rootID + siblingReferenceRootID;
		var connectionObj = new SiblingConnection(connectionID, rootID, siblingReferenceRootID);
		this.siblingConnections[connectionID] = connectionObj;
		this.siblingConnectionCount++;

		this.rootNodes[rootID].setSibling(siblingReferenceRootID, "reference");
		this.rootNodes[siblingReferenceRootID].setSibling(rootID, "citedby");
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
	this.selectNode = function(nodeObj) {
		selectedNode = nodeObj;
		selectedNode.changeStrokeColor("dimgray");
		visualizerModule.updateCanvas();
	}
	this.clearSelectedNode = function() {
		selectedNode.changeStrokeColor("black");
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
}