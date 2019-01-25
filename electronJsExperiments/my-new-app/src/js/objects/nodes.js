function Node(ID, metadata, radius){
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
}
function RootNode(ID, metadata, radius, x, y) {
	Node.call(this, ID, metadata, radius);
	
	this.x = x;
	this.y = y;
	this.references = [];
	this.citedByNodes = []

	var mouseOver = function(rootNodeObject) {
		var nodeCenter = visualizerModule.getNodeCenterById(rootNodeObject.getID());
		var nodeRadius = visualizerModule.getNodeRadiusById(rootNodeObject.getID());

		var overlayText; 
		var rootNodeTitle = rootNodeObject.getTitle();
		if (rootNodeTitle) {
			overlayText = rootNodeTitle;
		} else {
			overlayText = "Title not available.";
		}
		console.log(overlayText);
		overlayerModule.drawTitleOverlay((nodeCenter.x+nodeRadius), (nodeCenter.y-nodeRadius), overlayText);
	};
	var mouseOut = function(rootNodeObject) {
		overlayerModule.clearTitleOverlay();
	};

	this.visualObject = visualizerModule.createRootNode(this.radius, this.x, this.y, this.ID, mouseOver, mouseOut, this);

	this.createReference = function(ID, metadata, radius) {
		const referencePosition = this.references.length;
		var referenceNode = new ReferenceNode(this, ID, metadata, radius, referencePosition);
		this.references.push(referenceNode);
	}
	this.createCitedBy = function(ID, metadata, radius) {
		const referencePosition = this.citedByNodes.length;
		var citedByNode = new CitedByNode(this, ID, metadata, radius, referencePosition);
		this.citedByNodes.push(citedByNode);
	}

	RootNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(RootNode.prototype, 'constructor', { 
	    value: RootNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}
function ReferenceNode(rootNode, ID, metadata, radius, referencePosition) {
	Node.call(this, ID, metadata, radius);

	this.rootNode = rootNode;
	this.referencePosition = referencePosition;

	var mouseOverLeafNode = function(referenceNodeObject) {
		var nodeCenter = visualizerModule.getNodeCenterById(referenceNodeObject.getID());
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

	this.visualObject = visualizerModule.createReferenceNode(this.rootNode.getVisualObject(), this.referencePosition, this.ID, this.radius, mouseOverLeafNode, mouseOutLeafNode, this);

	ReferenceNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(ReferenceNode.prototype, 'constructor', { 
	    value: ReferenceNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}
function CitedByNode(rootNode, ID, metadata, radius, referencePosition) {
	Node.call(this, ID, metadata, radius);

	this.rootNode = rootNode;
	this.referencePosition = referencePosition;

	var mouseOverLeafNode = function(referenceNodeObject) {
		var nodeCenter = visualizerModule.getNodeCenterById(referenceNodeObject.getID());
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

	this.visualObject = visualizerModule.createCitedByNode(this.rootNode.getVisualObject(), this.referencePosition, this.ID, this.radius, mouseOverLeafNode, mouseOutLeafNode, this);

	CitedByNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(CitedByNode.prototype, 'constructor', { 
	    value: CitedByNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}