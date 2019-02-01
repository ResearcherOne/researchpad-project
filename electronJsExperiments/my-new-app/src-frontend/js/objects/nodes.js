function Node(ID, metadata, radius){
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
function RootNode(ID, metadata, radius, x, y, dragstartCallback, dragendCallback) {
	Node.call(this, ID, metadata, radius);
	
	this.x = x;
	this.y = y;

	this.references = {};
	this.referenceCount = 0;

	this.citedByNodes = {};
	this.citedByCount = 0;

	this.siblingReferences = {};
	this.siblingReferenceCount = 0;

	this.siblingCitedBy = {};
	this.siblingCitedByCount = 0;

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

	const isDraggable = false;
	this.visualObject = visualizerModule.createRootNode(this.radius, this.x, this.y, this.ID, isDraggable, mouseOver, mouseOut, this, dragstartCallback, dragendCallback);

	this.createReference = function(ID, metadata, radius) {
		const referencePosition = this.referenceCount;
		this.references[ID] = new ReferenceNode(this, ID, metadata, radius, referencePosition, dragstartCallback, dragendCallback);
		this.referenceCount++;
	}
	this.createCitedBy = function(ID, metadata, radius) {
		const citedByPosition = this.citedByCount;
		this.citedByNodes[ID] = new CitedByNode(this, ID, metadata, radius, citedByPosition, dragstartCallback, dragendCallback);
		this.citedByCount++;
	}
	this.addSiblingReference = function(rootNode) { //connection maintainers are references or citedbys
		this.siblingReferences[rootNode.getID()] = rootNode;
		this.siblingReferenceCount++;
		visualizerModule.connectVisualObjectsByID(this.ID, rootNode.getID());
			//need to store connection. V0-2
	}
	this.removeReference = function(ID) {
		this.references[ID].destroy();
		this.references[ID] = undefined;
	}
	this.removeCitedBy = function(ID) {
		this.siblingCitedBy[ID].destroy();
		this.siblingCitedBy[ID] = undefined;
	}
	
	RootNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(RootNode.prototype, 'constructor', { 
	    value: RootNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}
function ReferenceNode(rootNode, ID, metadata, radius, referencePosition, dragstartCallback, dragendCallback) {
	Node.call(this, ID, metadata, radius);

	this.rootNode = rootNode;
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

	this.visualObject = visualizerModule.createReferenceNode(this.rootNode.getVisualObject(), this.referencePosition, this.ID, this.radius, mouseOverLeafNode, mouseOutLeafNode, this, dragstartCallback, dragendCallback);

	this.getRootNode = function() {
		return this.rootNode;
	}

	ReferenceNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(ReferenceNode.prototype, 'constructor', { 
	    value: ReferenceNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}
function CitedByNode(rootNode, ID, metadata, radius, referencePosition, dragstartCallback, dragendCallback) {
	Node.call(this, ID, metadata, radius);

	this.rootNode = rootNode;
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

	this.visualObject = visualizerModule.createCitedByNode(this.rootNode.getVisualObject(), this.referencePosition, this.ID, this.radius, mouseOverLeafNode, mouseOutLeafNode, this, dragstartCallback, dragendCallback);

	CitedByNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(CitedByNode.prototype, 'constructor', { 
	    value: CitedByNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}
function DummyNode(ID, radius, x, y, dragstartCallback, dragendCallback) {
	Node.call(this, ID, {}, radius);

	this.x = x;
	this.y = y;

	var mouseOver = function() {};
	var mouseOut = function() {};

	var mouseOver = function(rootNodeObject) { //SHALL NOT USE "this", when you pass callback to other object, "this" context will vary!!!
		document.body.style.cursor = 'pointer';
	};
	var mouseOut = function(rootNodeObject) {
		document.body.style.cursor = 'default';
	};

	const isDraggable = true;
	this.visualObject = visualizerModule.createRootNode(this.radius, this.x, this.y, this.ID, isDraggable, mouseOver, mouseOut, this, dragstartCallback, dragendCallback);
	visualizerModule.changeFillColorOfVisualObject(this.visualObject, "grey");

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
	visualizerModule.initializeModule(konvaDivID, width, height);

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
}