function RootNode(ID, metadata, radius, initialX, initialY, dragstartCallback, dragendCallback, mouseOverCallback, mouseOutCallback, clickedCallback) {
	Node.call(this, ID, metadata, radius);

	this.references = {};
	this.referenceCount = 0;

	this.citedByNodes = {};
	this.citedByCount = 0;

	this.siblingIDs = {};
	this.siblingCount = 0;

	var mouseOver = function(rootNodeObject) {
		if(mouseOverCallback) mouseOverCallback(rootNodeObject);
	}
	var mouseOut = function(rootNodeObject) {
		if(mouseOutCallback) mouseOutCallback(rootNodeObject);
	}

	var getSerializedLeafNodesObj = function(leafNodes) {
		var serializedLeafNodes = {};
		for (var leafNodeID in leafNodes){
			serializedLeafNodes[leafNodeID] = leafNodes[leafNodeID].serialize();
		}
		return serializedLeafNodes;
	}

	const isDraggable = false;
	this.visualObject = visualizerModule.createRootNode(this.radius, initialX, initialY, this.ID, isDraggable, mouseOver, mouseOut, this, dragstartCallback, dragendCallback, clickedCallback);

	this.createReference = function(ID, metadata, radius) {
		const referencePosition = this.referenceCount;
		this.references[ID] = new ReferenceNode(this.ID, this.visualObject, ID, metadata, radius, referencePosition, dragstartCallback, dragendCallback, mouseOver, mouseOut);
		this.references[ID].hide();
		this.referenceCount++;
	}
	this.createCitedBy = function(ID, metadata, radius) {
		const citedByPosition = this.citedByCount;
		this.citedByNodes[ID] = new CitedByNode(this.ID, this.visualObject, ID, metadata, radius, citedByPosition, dragstartCallback, dragendCallback, mouseOver, mouseOut);
		this.citedByNodes[ID].hide();
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
			reconstructedReferences[referenceNodeID] = new ReferenceNode(this.ID, this.visualObject, leafNodeData.ID, leafNodeData.metadata, leafNodeData.radius, leafNodeData.referencePosition, dragstartCallback, dragendCallback, mouseOver, mouseOut);
			reconstructedReferences[referenceNodeID].hide();
		}
		this.referenceCount = refCount;
		this.references = reconstructedReferences;

		var reconstructedCitedbyNodes = {}
		for (var referenceNodeID in serializedCitedbyNodes){
			var leafNodeData = JSON.parse(serializedCitedbyNodes[referenceNodeID]);
			reconstructedCitedbyNodes[referenceNodeID] = new CitedByNode(this.ID, this.visualObject, leafNodeData.ID, leafNodeData.metadata, leafNodeData.radius, leafNodeData.referencePosition, dragstartCallback, dragendCallback, mouseOver, mouseOut);
			reconstructedCitedbyNodes[referenceNodeID].hide();
		}
		this.citedByCount = citedbyCount;
		this.citedByNodes = reconstructedCitedbyNodes;
	}

	this.hideLeafNodes = function() {
		for (var citationNodeID in this.citedByNodes){
			this.citedByNodes[citationNodeID].hide();
		}
		for (var referenceNodeID in this.references){
			this.references[referenceNodeID].hide();
		}
	}

	this.showLeafNodes = function() {
		for (var citationNodeID in this.citedByNodes){
			this.citedByNodes[citationNodeID].show();
		}
		for (var referenceNodeID in this.references){
			this.references[referenceNodeID].show();
		}
    }
    
    this.changeStrokeColor = function(color) {
        visualizerModule.setStrokeColor(this.visualObject, color);
    }

	RootNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(RootNode.prototype, 'constructor', { 
	    value: RootNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}