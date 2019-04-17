function RootNode(ID, academicDataLibrary, radius, initialX, initialY, dragstartCallback, dragendCallback, mouseOverCallback, mouseOutCallback, clickedCallback) {
	Node.call(this, ID, academicDataLibrary, radius);

	this.references = {};
	this.referenceCount = 0;

	this.citedByNodes = {};
	this.citedByCount = 0;

	this.siblingIDs = {};
	this.siblingCount = 0;

	this.hideLeafNodesTimer = null;

	this.clickedCallback = clickedCallback;

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
	this.visualObject = visualizerModule.createRootNode(this.radius, initialX, initialY, this.ID, isDraggable, mouseOver, mouseOut, this, dragstartCallback, dragendCallback, this.clickedCallback);

	this.createReference = function(ID, academicDataLibrary, radius) {
		const referencePosition = this.referenceCount;
		this.references[ID] = new ReferenceNode(this.ID, this.visualObject, ID, academicDataLibrary, radius, referencePosition, dragstartCallback, dragendCallback, mouseOver, mouseOut, this.clickedCallback);
		this.references[ID].hide();
		this.referenceCount++;
	}
	this.createCitedBy = function(ID, academicDataLibrary, radius) {
		const citedByPosition = this.citedByCount;
		this.citedByNodes[ID] = new CitedByNode(this.ID, this.visualObject, ID, academicDataLibrary, radius, citedByPosition, dragstartCallback, dragendCallback, mouseOver, mouseOut, this.clickedCallback);
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
		serializedNodeObj.academicDataLibrary = this.academicDataLibrary;
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
			reconstructedReferences[referenceNodeID] = new ReferenceNode(this.ID, this.visualObject, leafNodeData.ID, leafNodeData.academicDataLibrary, leafNodeData.radius, leafNodeData.referencePosition, dragstartCallback, dragendCallback, mouseOver, mouseOut, this.clickedCallback);
			reconstructedReferences[referenceNodeID].hide();
		}
		this.referenceCount = refCount;
		this.references = reconstructedReferences;

		var reconstructedCitedbyNodes = {}
		for (var referenceNodeID in serializedCitedbyNodes){
			var leafNodeData = JSON.parse(serializedCitedbyNodes[referenceNodeID]);
			reconstructedCitedbyNodes[referenceNodeID] = new CitedByNode(this.ID, this.visualObject, leafNodeData.ID, leafNodeData.academicDataLibrary, leafNodeData.radius, leafNodeData.referencePosition, dragstartCallback, dragendCallback, mouseOver, mouseOut, this.clickedCallback);
			reconstructedCitedbyNodes[referenceNodeID].hide();
		}
		this.citedByCount = citedbyCount;
		this.citedByNodes = reconstructedCitedbyNodes;
	}

	this.hideLeafNodes = function(durationSec) {
		/*
		for (var citationNodeID in this.citedByNodes){
			this.citedByNodes[citationNodeID].hide();
		}
		for (var referenceNodeID in this.references){
			this.references[referenceNodeID].hide();
		}
		*/
		if(!this.hideLeafNodesTimer) {
			this.hideLeafNodesTimer = setTimeout(function(rootNodeObj){
				for (var citationNodeID in rootNodeObj.citedByNodes){
					rootNodeObj.citedByNodes[citationNodeID].hide();
				}
				for (var referenceNodeID in rootNodeObj.references){
					rootNodeObj.references[referenceNodeID].hide();
				}

				rootNodeObj.hideLeafNodesTimer = null;
			}, durationSec * 1000, this);
		} else {
			clearTimeout(this.hideLeafNodesTimer);
			this.hideLeafNodesTimer = setTimeout(function(rootNodeObj){
				rootNodeObj.hideLeafNodes();
				rootNodeObj.hideLeafNodesTimer = null;
			}, durationSec * 1000, this);
		}
	}

	this.showLeafNodes = function() {
		clearTimeout(this.hideLeafNodesTimer);
		this.hideLeafNodesTimer = null;
		for (var citationNodeID in this.citedByNodes){
			this.citedByNodes[citationNodeID].show();
		}
		for (var referenceNodeID in this.references){
			this.references[referenceNodeID].show();
		}
	}

	RootNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(RootNode.prototype, 'constructor', { 
	    value: RootNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}