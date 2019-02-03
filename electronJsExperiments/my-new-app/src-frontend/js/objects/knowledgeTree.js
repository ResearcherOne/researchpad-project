function Node(ID, metadata, radius){ //Abstract Class
	this.ID = ID;
	this.metadata = metadata;
	this.radius = radius;

	this.visualObject;
	this.placeholderVisualObject;

	this.getVisualObject = function() {
		return this.visualObject;
	}

	this.getID = function() {
		return this.ID;
	}

	this.getTitle = function() {
		return this.metadata.title;
	}

	this.getAbsolutePosition = function() {
		return {x: visualizerModule.getNodeCenterById(this.ID).x, y:visualizerModule.getNodeCenterById(this.ID).y};
	}

	this.getPositionOnCamera = function() {
		var cameraPos = visualizerModule.getCanvasPos();
		var nodePos = visualizerModule.getNodeCenterById(this.ID);
		var nodeOnCameraPos = {x: cameraPos.x+nodePos.x, y: cameraPos.y+nodePos.y};
		return nodeOnCameraPos;
	}
	/*
	this.setPlaceholderState = function(isActivated) {
		if(isActivated) {
			this.placeholderVisualObject = visualizerModule.createPlaceholderVisualObject(this.visualObject);
		} else {
			visualizerModule.removeVisualObject(this.placeholderVisualObject);
		}
	}
	*/
	this.destroy = function() {
		//if(this.placeholderVisualObject) visualizerModule.removeVisualObject(this.placeholderVisualObject);
		visualizerModule.removeVisualObject(this.visualObject);
	}

	this.setPosition = function(x, y) {
		visualizerModule.setPosition(this.visualObject, x,y);
	}
}
function RootNode(ID, metadata, radius, initialX, initialY, dragstartCallback, dragendCallback) {
	Node.call(this, ID, metadata, radius);

	this.references = {};
	this.referenceCount = 0;

	this.citedByNodes = {};
	this.citedByCount = 0;

	this.siblingIDs = {};
	this.siblingCount = 0;

	var mouseOver = function(rootNodeObject) { //SHALL NOT USE "this", when you pass callback to other object, "this" context will vary!!!
		//document.body.style.cursor = 'pointer';
		var nodeCenter = rootNodeObject.getPositionOnCamera();
		var nodeRadius = visualizerModule.getNodeRadiusById(rootNodeObject.getID());

		rootNodeObject.getPositionOnCamera();
		var overlayText; 
		var rootNodeTitle = rootNodeObject.getTitle();
		if (rootNodeTitle) {
			overlayText = rootNodeTitle;
		} else {
			overlayText = "Title not available.";
		}
		overlayerModule.drawTitleOverlay((nodeCenter.x+nodeRadius), (nodeCenter.y-nodeRadius), overlayText);
	};
	var mouseOut = function(rootNodeObject) {
		//document.body.style.cursor = 'default';
		overlayerModule.clearTitleOverlay();
	};
	var getSerializedLeafNodesObj = function(leafNodes) {
		var serializedLeafNodes = {};
		for (var leafNodeID in leafNodes){
			serializedLeafNodes[leafNodeID] = leafNodes[leafNodeID].serialize();
		}
		return serializedLeafNodes;
	}

	const isDraggable = false;
	this.visualObject = visualizerModule.createRootNode(this.radius, initialX, initialY, this.ID, isDraggable, mouseOver, mouseOut, this, dragstartCallback, dragendCallback);

	this.createReference = function(ID, metadata, radius) {
		const referencePosition = this.referenceCount;
		this.references[ID] = new ReferenceNode(this.ID, this.visualObject, ID, metadata, radius, referencePosition, dragstartCallback, dragendCallback);
		this.referenceCount++;
	}
	this.createCitedBy = function(ID, metadata, radius) {
		const citedByPosition = this.citedByCount;
		this.citedByNodes[ID] = new CitedByNode(this.ID, this.visualObject, ID, metadata, radius, citedByPosition, dragstartCallback, dragendCallback);
		this.citedByCount++;
	}
	this.setSibling = function(nodeID, siblingType) {
		this.siblingIDs[nodeID] = siblingType;
		this.siblingCount++;
	}
	this.removeSibling = function(nodeID) {
		this.siblingIDs[nodeID] = null;
		delete this.siblingIDs[nodeID];
		this.siblingCount--;
	}
	this.removeReference = function(ID) {
		this.references[ID].destroy();
		this.references[ID] = undefined;
		delete this.references[ID];
		this.referenceCount--;
	}
	this.removeCitedBy = function(ID) {
		this.citedByNodes[ID].destroy();
		this.citedByNodes[ID] = undefined;
		delete this.citedByNodes[ID];
		this.citedByCount--;
	}
	this.serialize = function() {
		var serializedNodeObj = {};
		serializedNodeObj.ID = this.ID;
		serializedNodeObj.metadata = this.metadata;
		serializedNodeObj.radius = this.radius;
		serializedNodeObj.x = this.getAbsolutePosition().x;
		serializedNodeObj.y = this.getAbsolutePosition().y;
		serializedNodeObj.references = getSerializedLeafNodesObj(this.references);
		serializedNodeObj.referenceCount = this.referenceCount;

		//this.citedByNodes = {};
		//this.citedByCount = 0;

		serializedNodeObj.siblingIDs = this.siblingIDs;
		serializedNodeObj.siblingCount = this.siblingCount;
		return JSON.stringify(serializedNodeObj);
	}
	
	RootNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(RootNode.prototype, 'constructor', { 
	    value: RootNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}
function ReferenceNode(rootNodeID, rootNodeVisualObj, ID, metadata, radius, referencePosition, dragstartCallback, dragendCallback) {
	Node.call(this, ID, metadata, radius);

	this.rootNodeID = rootNodeID;
	this.referencePosition = referencePosition;

	var mouseOverLeafNode = function(referenceNodeObject) {
		document.body.style.cursor = 'pointer';
		var nodeCenter = referenceNodeObject.getPositionOnCamera();
		var nodeRadius = visualizerModule.getNodeRadiusById(referenceNodeObject.getID());

		var title = referenceNodeObject.getTitle();
		var overlayText; 
		if (title) {
			overlayText = title;
		} else {
			overlayText = "Title not available.";
		}
		overlayerModule.drawTitleOverlay((nodeCenter.x+nodeRadius), (nodeCenter.y-nodeRadius), overlayText);
	}

	var mouseOutLeafNode = function(referenceNodeObject) {
		document.body.style.cursor = 'default';
		overlayerModule.clearTitleOverlay();
	}

	this.visualObject = visualizerModule.createReferenceNode(rootNodeVisualObj, this.referencePosition, this.ID, this.radius, mouseOverLeafNode, mouseOutLeafNode, this, dragstartCallback, dragendCallback);

	this.getRootNodeID = function() {
		return this.rootNodeID;
	}

	this.serialize = function() {
		var serializedReferenceObj = {};
		serializedReferenceObj.ID = this.ID;
		serializedReferenceObj.metadata = this.metadata;
		serializedReferenceObj.radius = this.radius;

		serializedReferenceObj.rootNodeID = this.rootNodeID;
		serializedReferenceObj.referencePosition = this.referencePosition;

		return JSON.stringify(serializedReferenceObj);
	}

	ReferenceNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(ReferenceNode.prototype, 'constructor', { 
	    value: ReferenceNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}
function CitedByNode(rootNodeID, rootNodeVisualObj, ID, metadata, radius, referencePosition, dragstartCallback, dragendCallback) {
	Node.call(this, ID, metadata, radius);

	this.rootNodeID = rootNodeID;
	this.referencePosition = referencePosition;

	var mouseOverLeafNode = function(referenceNodeObject) {
		var nodeCenter = referenceNodeObject.getPositionOnCamera();
		var nodeRadius = visualizerModule.getNodeRadiusById(referenceNodeObject.getID());

		var title = referenceNodeObject.getTitle();
		var overlayText; 
		if (title) {
			overlayText = title;
		} else {
			overlayText = "Title not available.";
		}
		overlayerModule.drawTitleOverlay((nodeCenter.x+nodeRadius), (nodeCenter.y-nodeRadius), overlayText);
	}

	var mouseOutLeafNode = function(referenceNodeObject) {
		overlayerModule.clearTitleOverlay();
	}

	this.visualObject = visualizerModule.createCitedByNode(rootNodeVisualObj, this.referencePosition, this.ID, this.radius, mouseOverLeafNode, mouseOutLeafNode, this, dragstartCallback, dragendCallback);

	CitedByNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(CitedByNode.prototype, 'constructor', { 
	    value: CitedByNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}
function DummyNode(ID, radius, initalX, initialY, dragstartCallback, dragendCallback) {
	Node.call(this, ID, {}, radius);

	var mouseOver = function(rootNodeObject) { //SHALL NOT USE "this", when you pass callback to other object, "this" context will vary!!!
		document.body.style.cursor = 'pointer';
	};
	var mouseOut = function(rootNodeObject) {
		document.body.style.cursor = 'default';
	};
	const isDraggable = true;

	//Initialization
	this.visualObject = visualizerModule.createRootNode(this.radius, initalX, initialY, this.ID, isDraggable, mouseOver, mouseOut, this, dragstartCallback, dragendCallback);
	visualizerModule.changeFillColorOfVisualObject(this.visualObject, "grey");

	//Public Functions
	this.setOpacity = function(opacity) {
		visualizerModule.setOpacity(this.visualObject, opacity);
	}

	DummyNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(DummyNode.prototype, 'constructor', { 
	    value: DummyNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}

function KnowledgeTree(konvaDivID, width, height) {
	//Config & Private Functions
	this.konvaDivID = konvaDivID;
	this.width = width;
	this.height = height;

	this.rootNodes = {};
	this.rootNodeCount = 0;

	this.siblingConnections = {};
	this.siblingConnectionCount = 0;

	var dragStartCallback = null;
	var dragEndCallback = null;

	var nodeCreateRequestCallback = null;
	var emptyRootNode = null;
	var emptyRootNodeConfig = {
		x: 40,
		y: 40,
		ID: "emptyRootNode",
		radius: 30,
		opacity: 0.6
	};

	var emptyRootNodeDragStart = function(emptyRootNode) {
		emptyRootNode.setOpacity(emptyRootNodeConfig.opacity);
	}

	var emptyRootNodeEnd = function(emptyRootNode) {
		const x = emptyRootNode.getAbsolutePosition().x;
		const y = emptyRootNode.getAbsolutePosition().y;

		emptyRootNode.setPosition(emptyRootNodeConfig.x, emptyRootNodeConfig.y);

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

	var initializeVisualToolset = function() {
		emptyRootNode = DummyNode(emptyRootNodeConfig.ID, emptyRootNodeConfig.radius, emptyRootNodeConfig.x, emptyRootNodeConfig.y, emptyRootNodeDragStart, emptyRootNodeEnd);
	}

	var getRandomInt = function(max) {
		return Math.floor(Math.random() * Math.floor(max));
	}

	var serializeRootNodes = function(rootNodes) {
		var serializedRootNodes = {};

		for (var rootNodeObjID in rootNodes){
			serializedRootNodes[rootNodeObjID] = rootNodes[rootNodeObjID].serialize();
			console.log(serializedRootNodes[rootNodeObjID]);
		}
		//for each key
			//call class.serialize() and store it
		//return obj
	}

	var serializeSiblingConnections = function(obj) {

	}

	//Initialization
	visualizerModule.initializeModule(this.konvaDivID, this.width, this.height);
	initializeVisualToolset();

	//Public Functions
	this.createRootNode = function (metadata, radius, x, y) {
		const ID = "root-"+metadata.DOI+getRandomInt(99999);
		this.rootNodes[ID] = new RootNode(ID, metadata, radius, x, y, nodeDragStartCallback, nodeDragEndCallback);
		this.rootNodeCount++;
		return ID;
	}
	this.addReferenceToRootNode = function(rootID, refMetadata, radius) {
		const refID = "ref-"+refMetadata.DOI+getRandomInt(99999);
		this.rootNodes[rootID].createReference(refID, refMetadata, radius);
		return refID;
	}
	this.removeReferenceFromRootNode = function(rootID, refID) {
		this.rootNodes[rootID].removeReference(refID);
	}
	this.setSiblingReference = function(rootID, siblingReferenceRootID) {
		var connectionObj = visualizerModule.connectVisualObjectsByID(rootID, siblingReferenceRootID);
		const connectionID = rootID + siblingReferenceRootID;
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
		visualizerModule.moveCanvas(x, y);
	}

	this.getMousePositionOnCamera = function() {
		return {x: visualizerModule.getMousePosOnCanvas().x, y: visualizerModule.getMousePosOnCanvas().y};
	}

	this.getMouseAbsolutePosition = function() {
		var absoluteMouseX = visualizerModule.getMousePosOnCanvas().x - visualizerModule.getCanvasPos().x;
		var absoluteMouseY = visualizerModule.getMousePosOnCanvas().y - visualizerModule.getCanvasPos().y;
		return {x: absoluteMouseX, y: absoluteMouseY};
	}

	this.getCameraPosition = function() {
		return {x: visualizerModule.getCanvasPos().x, y: visualizerModule.getCanvasPos().y};
	}
	this.serialize = function() {
		var serializedKnowledgeTree = {};
		serializedKnowledgeTree.rootNodes = serializeRootNodes(this.rootNodes);
		serializedKnowledgeTree.rootNodeCount = this.rootNodeCount;

		//this.siblingConnections = {};
		//this.siblingConnectionCount = 0;
	}
}