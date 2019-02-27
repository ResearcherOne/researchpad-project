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

function KnowledgeTree(konvaDivID, width, height) {
	//Config & Private Functions
	this.konvaDivID = konvaDivID;
	this.width = width;
	this.height = height;

	this.rootNodes = {};
	this.rootNodeCount = 0;

	this.siblingConnections = {};
	this.siblingConnectionCount = 0;

	this.emptyRootNode = null;
	
	var emptyRootNodeConfig = {
		x: 50,
		y: 50,
		ID: "emptyRootNode",
		radius: 30,
		opacity: 0.6
	};
	
	var dragStartCallback = null;
	var dragEndCallback = null;

	var nodeCreateRequestCallback = null;

	var emptyRootNodeDragStart = function(emptyRootNode) {
		emptyRootNode.setOpacity(emptyRootNodeConfig.opacity);
	}

	var emptyRootNodeEnd = function(emptyRootNode) {
		const x = emptyRootNode.getAbsolutePosition().x;
		const y = emptyRootNode.getAbsolutePosition().y;

		emptyRootNode.setPositionOnCamera(emptyRootNodeConfig.x, emptyRootNodeConfig.y);

		if(nodeCreateRequestCallback) nodeCreateRequestCallback(x, y);
	}

	var nodeDragStartCallback = function(nodeObj) {
		if(dragStartCallback) {
			if(nodeObj.constructor.name == "RootNode") {
				console.log("Type of rootnode");
				dragStartCallback("root", nodeObj);
			} else if (nodeObj.constructor.name == "ReferenceNode") {
				console.log("Type of reference node");
				dragStartCallback("ref", nodeObj);
			} else if (nodeObj.constructor.name == "CitedByNode") {
				console.log("Type of citedby node");
				dragStartCallback("citedby", nodeObj);
			} else {
				console.log("Unknown type.");
				console.log(nodeObj.constructor.name);
				dragStartCallback("unknown", nodeObj);
			}
		} else {
			//callback not set.
		}

	}
	var nodeDragEndCallback = function(nodeObj) {
		if(dragEndCallback) {
			if(nodeObj.constructor.name == "RootNode") {
				console.log("Type of rootnode");
				dragEndCallback("root", nodeObj);
			} else if (nodeObj.constructor.name == "ReferenceNode") {
				console.log("Type of reference node");
				dragEndCallback("ref", nodeObj);
			} else if (nodeObj.constructor.name == "CitedByNode") {
				console.log("Type of citedby node");
				dragEndCallback("citedby", nodeObj);
			} else {
				console.log("Unknown type.");
				console.log(nodeObj.constructor.name);
				dragEndCallback("unknown", nodeObj);
			}
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
			reconstructedRootNodes[serializedRootNodeID] = new RootNode(rootNodeData.ID, rootNodeData.metadata, rootNodeData.radius, rootNodeData.x, rootNodeData.y, nodeDragStartCallback, nodeDragEndCallback);
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

	//Initialization
	visualizerModule.initializeModule(this.konvaDivID, this.width, this.height);
	this.emptyRootNode = new DummyNode(emptyRootNodeConfig.ID, emptyRootNodeConfig.radius, emptyRootNodeConfig.x, emptyRootNodeConfig.y, emptyRootNodeDragStart, emptyRootNodeEnd);
	this.emptyRootNode.setOpacity(emptyRootNodeConfig.opacity);
	//Public Functions
	this.getRootNodeTitleById = function(ID) {
		return this.rootNodes[ID].getTitle();
	}
	this.createRootNode = function (metadata, radius, x, y) {
		const ID = ("root-"+metadata.title+getRandomInt(99999)).hashCode();
		this.rootNodes[ID] = new RootNode(ID, metadata, radius, x, y, nodeDragStartCallback, nodeDragEndCallback);
		this.rootNodeCount++;
		return ID;
	}
	this.createRootNodeAtMousePos = function(metadata, radius) {
		const x = this.getMouseAbsolutePosition().x;
		const y = this.getMouseAbsolutePosition().y;

		const ID = ("root-"+metadata.title+getRandomInt(99999)).hashCode();
		this.rootNodes[ID] = new RootNode(ID, metadata, radius, x, y, nodeDragStartCallback, nodeDragEndCallback);
		this.rootNodeCount++;
		return ID;
	}
	this.addReferenceToRootNode = function(rootID, refMetadata, radius) {
		const refID = ("ref-"+refMetadata.title+getRandomInt(99999)).hashCode();
		this.rootNodes[rootID].createReference(refID, refMetadata, radius);
		return refID;
	}
	this.removeReferenceFromRootNode = function(rootID, refID) {
		this.rootNodes[rootID].removeReference(refID);
	}
	this.removeCitedbyFromRootNode = function(rootID, citedByID) {
		this.rootNodes[rootID].removeCitedBy(citedByID);
	}
	this.addCitedbyToRootNode = function(rootID, citedByMetadata, radius) {
		const refID = ("ref-"+citedByMetadata.title+getRandomInt(99999)).hashCode();
		this.rootNodes[rootID].createCitedBy(refID, citedByMetadata, radius);
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
	this.setNodeCreateRequestCallback = function(callback) {
		nodeCreateRequestCallback = callback;
	}
	this.moveCamera = function(x, y) {
		overlayerModule.clearTitleOverlay();
		visualizerModule.moveCanvas(x, y);
		this.emptyRootNode.setPositionOnCamera(emptyRootNodeConfig.x, emptyRootNodeConfig.y);
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
}