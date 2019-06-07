function RootNode(
	ID,
	academicDataLibrary,
	radius,
	initialX,
	initialY,
	dragstartCallback,
	dragendCallback,
	mouseOverCallback,
	mouseOutCallback,
	clickedCallback
) {
	Node.call(this, ID, academicDataLibrary);

	this.radius = radius;

	this.references = {};
	this.referenceCount = 0;

	this.citedByNodes = {};
	this.citedByCount = 0;

	this.suggestedCitedByNodeList = [];
	this.suggestedReferenceNodeList = [];

	this.siblingIDs = {};
	this.siblingCount = 0;

	this.clickedCallback = clickedCallback;

	var mouseOver = function(rootNodeObject, visualObjID) {
		if (mouseOverCallback) mouseOverCallback(rootNodeObject, visualObjID);
	};
	var mouseOut = function(rootNodeObject, visualObjID) {
		if (mouseOutCallback) mouseOutCallback(rootNodeObject, visualObjID);
	};

	var getSerializedLeafNodesObj = function(leafNodes) {
		var serializedLeafNodes = {};
		for (var leafNodeID in leafNodes) {
			serializedLeafNodes[leafNodeID] = leafNodes[leafNodeID].serialize();
		}
		return serializedLeafNodes;
	};

	const isDraggable = false;
	this.visualObject = visualizerModule.createRootNode(
		this.radius,
		initialX,
		initialY,
		this.ID,
		isDraggable,
		mouseOver,
		mouseOut,
		this,
		dragstartCallback,
		dragendCallback,
		this.clickedCallback
	);

	this.getVisualObj = function() {
		return this.visualObject;
	};
	this.connectCitedBy = function(refID) {
		this.citedByNodes[refID] = 1;
		this.citedByCount++;
	};
	this.connectReference = function(refID) {
		this.references[refID] = 1;
		this.referenceCount++;
	};
	this.setSibling = function(nodeID, siblingType) {
		this.siblingIDs[nodeID] = siblingType;
		this.siblingCount++;
	};
	this.removeSibling = function(nodeID) {
		this.siblingIDs[nodeID] = null;
		delete this.siblingIDs[nodeID];
		this.siblingCount--;
	};
	this.removeReferenceConnection = function(ID) {
		this.references[ID] = undefined;
		delete this.references[ID];
		this.referenceCount--;
	};
	this.removeCitedByConnection = function(ID) {
		this.citedByNodes[ID] = undefined;
		delete this.citedByNodes[ID];
		this.citedByCount--;
	};
	this.getCitedByCount = function() {
		return this.citedByCount;
	};
	this.getReferenceCount = function() {
		return this.referenceCount;
	};

	this.serialize = function() {
		var serializedNodeObj = {};
		serializedNodeObj.ID = this.ID;
		serializedNodeObj.academicDataLibrary = this.academicDataLibrary;
		serializedNodeObj.radius = this.radius;
		serializedNodeObj.x = this.getAbsolutePosition(this.ID).x;
		serializedNodeObj.y = this.getAbsolutePosition(this.ID).y;

		serializedNodeObj.references = getSerializedLeafNodesObj(this.references);
		serializedNodeObj.referenceCount = this.referenceCount;

		serializedNodeObj.citedByNodes = getSerializedLeafNodesObj(
			this.citedByNodes
		);
		serializedNodeObj.citedByCount = this.citedByCount;

		serializedNodeObj.suggestedCitedByNodeList = this.suggestedCitedByNodeList;
		serializedNodeObj.suggestedReferenceNodeList = this.suggestedReferenceNodeList;

		serializedNodeObj.siblingIDs = this.siblingIDs;
		serializedNodeObj.siblingCount = this.siblingCount;
		return JSON.stringify(serializedNodeObj);
	};

	this.importSerializedReferences = function(
		serializedReferences,
		serializedCitedbyNodes,
		refCount,
		citedbyCount,
		suggestedCitedByNodeList,
		suggestedReferenceNodeList
	) {
		console.log("IMPORT WOWOWOWOWO")
		var reconstructedReferences = {};
		for (var referenceNodeID in serializedReferences) {
			var leafNodeData = JSON.parse(serializedReferences[referenceNodeID]);
			reconstructedReferences[referenceNodeID] = new ReferenceNode(
				this.ID,
				this.visualObject,
				leafNodeData.ID,
				leafNodeData.academicDataLibrary,
				leafNodeData.radius,
				leafNodeData.referencePosition,
				dragstartCallback,
				dragendCallback,
				mouseOver,
				mouseOut,
				this.clickedCallback
			);
			reconstructedReferences[referenceNodeID].hide();
		}
		this.referenceCount = refCount;
		this.references = reconstructedReferences;

		var reconstructedCitedbyNodes = {};
		for (var referenceNodeID in serializedCitedbyNodes) {
			var leafNodeData = JSON.parse(serializedCitedbyNodes[referenceNodeID]);
			reconstructedCitedbyNodes[referenceNodeID] = new CitedByNode(
				this.ID,
				this.visualObject,
				leafNodeData.ID,
				leafNodeData.academicDataLibrary,
				leafNodeData.radius,
				leafNodeData.referencePosition,
				dragstartCallback,
				dragendCallback,
				mouseOver,
				mouseOut,
				this.clickedCallback
			);
			reconstructedCitedbyNodes[referenceNodeID].hide();
		}
		this.citedByCount = citedbyCount;
		this.citedByNodes = reconstructedCitedbyNodes;

		this.suggestedCitedByNodeList = suggestedCitedByNodeList;
		this.suggestedReferenceNodeList = suggestedReferenceNodeList;
	};
	this.getSuggestedCitedByCount = function() {
		return this.suggestedCitedByNodeList.length;
	};
	this.getSuggestedReferenceCount = function() {
		return this.suggestedReferenceNodeList.length;
	};
	this.isSuggestedNode = function(nodeID) {
		const isSuggestedCitedBy =
			this.suggestedCitedByNodeList.indexOf(nodeID) > -1;
		if (isSuggestedCitedBy) return true;
		else return this.suggestedReferenceNodeList.indexOf(nodeID) > -1;
	};
	this.suggestCitedBy = function(citedByID) {
		this.suggestedCitedByNodeList.push(citedByID);
	};
	this.suggestReference = function(referenceID) {
		this.suggestedReferenceNodeList.push(referenceID);
	};
	this.removeCitedBySuggestion = function(citedByID) {
		const indexOfNode = this.suggestedCitedByNodeList.indexOf(citedByID);
		this.suggestedCitedByNodeList.splice(indexOfNode, 1);
	};
	this.removeReferenceSuggestion = function(referenceID) {
		const indexOfNode = this.suggestedReferenceNodeList.indexOf(referenceID);
		this.suggestedReferenceNodeList.splice(indexOfNode, 1);
	};
	this.getLeafNode = function(leafNodeID) {
		if (this.references[leafNodeID]) return this.references[leafNodeID];
		else return this.citedByNodes[leafNodeID];
	};
	this.getAllCitedByNodes = function() {
		return this.citedByNodes;
	};
	this.getAllReferenceNodes = function() {
		return this.references;
	};
	this.getSuggestedCitedByList = function() {
		return this.suggestedCitedByNodeList;
	};
	this.getSuggestedReferenceList = function() {
		return this.suggestedReferenceNodeList;
	};
	this.isConnectedToLeafNode = function(leafID){
		console.log("---"+this.ID+"---")
		console.log(leafID);
		console.log(this.radius);
		console.log(this.citedByNodes);
		console.log(this.references);
		if(this.references[leafID] || this.citedByNodes[leafID]) return true;
		else return false;
	}
	RootNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(RootNode.prototype, "constructor", {
		value: RootNode,
		enumerable: false, // so that it does not appear in 'for in' loop
		writable: true
	});
}
