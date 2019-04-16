function CitedByNode(rootNodeID, rootNodeVisualObj, ID, academicData, radius, referencePosition, dragstartCallback, dragendCallback, mouseOverCallback, mouseOutCallback, clickedCallback) { //nodeMouseOverCallback, nodeMouseOutCallback
	Node.call(this, ID, academicData, radius);

	this.rootNodeID = rootNodeID;
	this.referencePosition = referencePosition;

	var mouseOverLeafNode = function(referenceNodeObject) {
		if(mouseOverCallback) mouseOverCallback(referenceNodeObject);
	}

	var mouseOutLeafNode = function(referenceNodeObject) {
		if(mouseOutCallback) mouseOutCallback(referenceNodeObject);
	}
	this.getRootNodeID = function() {
		return this.rootNodeID;
	}

	this.visualObject = visualizerModule.createCitedByNode(rootNodeVisualObj, this.referencePosition, this.ID, this.radius, mouseOverLeafNode, mouseOutLeafNode, this, dragstartCallback, dragendCallback, clickedCallback);

	this.serialize = function() {
		var serializedObj = {};
		serializedObj.ID = this.ID;
		serializedObj.academicData = this.academicData;
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