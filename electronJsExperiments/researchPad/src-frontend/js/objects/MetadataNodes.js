/*
	Core Metadata
		Title
		Authors
	Ideal Extras
		Year
		Citedby Count
		Citedby List
		Reference Count
		References List

*/
function Node(ID, metadata, radius){ //Abstract Class
	this.ID = ID;
	this.metadata = metadata;
	this.radius = radius;

	this.visualObject;
	
	this.getVisualObject = function() {
		return this.visualObject;
	}

	this.getID = function() {
		return this.ID;
	}

	this.getTitle = function() {
		return this.metadata.title;
	}

	this.getCitedByLink = function() {
		return this.metadata.citedByLink;
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

	this.destroy = function() {
		visualizerModule.removeVisualObject(this.visualObject);
	}

	this.setPosition = function(x, y) {
		visualizerModule.setPosition(this.visualObject, x,y);
	}

	this.move = function(x, y) {
		visualizerModule.moveObject(this.visualObject, x, y);
	}

	this.getMetadata = function() {
		return this.metadata;
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

		serializedNodeObj.citedByNodes = getSerializedLeafNodesObj(this.citedByNodes);
		serializedNodeObj.citedByCount = this.citedByCount;

		serializedNodeObj.siblingIDs = this.siblingIDs;
		serializedNodeObj.siblingCount = this.siblingCount;
		return JSON.stringify(serializedNodeObj);
	}

	this.importSerializedReferences = function(serializedReferences, serializedCitedbyNodes, refCount, citedbyCount) {
		var reconstructedReferences = {}
		for (var referenceNodeID in serializedReferences){
			var leafNodeData = JSON.parse(serializedReferences[referenceNodeID]);
			reconstructedReferences[referenceNodeID] = new ReferenceNode(this.ID, this.visualObject, leafNodeData.ID, leafNodeData.metadata, leafNodeData.radius, leafNodeData.referencePosition, dragstartCallback, dragendCallback);
		}
		this.referenceCount = refCount;
		this.references = reconstructedReferences;

		var reconstructedCitedbyNodes = {}
		for (var referenceNodeID in serializedCitedbyNodes){
			var leafNodeData = JSON.parse(serializedCitedbyNodes[referenceNodeID]);
			reconstructedCitedbyNodes[referenceNodeID] = new CitedByNode(this.ID, this.visualObject, leafNodeData.ID, leafNodeData.metadata, leafNodeData.radius, leafNodeData.referencePosition, dragstartCallback, dragendCallback);
		}
		this.citedByCount = citedbyCount;
		this.references = reconstructedCitedbyNodes;

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

	this.getRootNodeID = function() {
		return this.rootNodeID;
	}

	this.visualObject = visualizerModule.createCitedByNode(rootNodeVisualObj, this.referencePosition, this.ID, this.radius, mouseOverLeafNode, mouseOutLeafNode, this, dragstartCallback, dragendCallback);

	this.serialize = function() {
		var serializedObj = {};
		serializedObj.ID = this.ID;
		serializedObj.metadata = this.metadata;
		serializedObj.radius = this.radius;

		serializedObj.rootNodeID = this.rootNodeID;
		serializedObj.referencePosition = this.referencePosition;

		return JSON.stringify(serializedObj);
	}

	CitedByNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(CitedByNode.prototype, 'constructor', { 
	    value: CitedByNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}
function DummyNode(ID, radius, initialX, initialY, dragstartCallback, dragendCallback) {
	Node.call(this, ID, {}, radius);

	this.initialCameraX = initialX; //TODO: Fetch camera pos from visualizer module
	this.initialCameraY = initialY; //TODO: Fetch camera pos from visualizer module

	var mouseOver = function(rootNodeObject) { //SHALL NOT USE "this", when you pass callback to other object, "this" context will vary!!!
		document.body.style.cursor = 'pointer';
	};
	var mouseOut = function(rootNodeObject) {
		document.body.style.cursor = 'default';
	};
	const isDraggable = true;

	//Initialization
	this.visualObject = visualizerModule.createRootNode(this.radius, initialX, initialY, this.ID, isDraggable, mouseOver, mouseOut, this, dragstartCallback, dragendCallback);
	visualizerModule.changeFillColorOfVisualObject(this.visualObject, "grey");

	//Public Functions
	this.setOpacity = function(opacity) {
		visualizerModule.setOpacity(this.visualObject, opacity);
	}

	this.setPositionOnCamera = function(x, y) {
		visualizerModule.setPositionOnCamera(this.visualObject, x, y);
	}

	DummyNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(DummyNode.prototype, 'constructor', { 
	    value: DummyNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}