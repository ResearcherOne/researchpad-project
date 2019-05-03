function RootNode(ID, academicDataLibrary, radius, initialX, initialY, dragstartCallback, dragendCallback, mouseOverCallback, mouseOutCallback, clickedCallback) {
	Node.call(this, ID, academicDataLibrary);

	this.radius = radius;

	this.referenceList = [];
	this.citedByNodeList = [];

	this.suggestedCitedByNodeList = [];
	this.suggestedReferenceNodeList = [];

	this.siblingIDs = {};
	this.siblingCount = 0;

	this.clickedCallback = clickedCallback;

	var mouseOver = function(rootNodeObject, visualObjID) {
		if(mouseOverCallback) mouseOverCallback(rootNodeObject, visualObjID);
	}
	var mouseOut = function(rootNodeObject, visualObjID) {
		if(mouseOutCallback) mouseOutCallback(rootNodeObject, visualObjID);
	}

	const isDraggable = false;
	this.visualObject = visualizerModule.createRootNode(this.radius, initialX, initialY, this.ID, isDraggable, mouseOver, mouseOut, this, dragstartCallback, dragendCallback, this.clickedCallback);

	this.getVisualObj = function() {
		return this.visualObject;
	}
	this.connectCitedBy = function(refID) {
		this.citedByNodeList.push(refID);
	}
	this.connectReference = function(refID) {
		this.referenceList.push(refID);
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
	this.removeReferenceConnection = function(ID) {
		this.referenceList = this.referenceList.remove(ID);
	}
	this.removeCitedByConnection = function(ID) {
		this.citedByNodeList = this.citedByNodeList.remove(ID);
	}
	this.getCitedByCount = function() {
		return this.citedByNodeList.length;
	}
	this.getReferenceCount = function() {
		return this.referenceList.length;
	}

	this.serialize = function() {
		var serializedNodeObj = {};
		serializedNodeObj.ID = this.ID;
		serializedNodeObj.academicDataLibrary = this.academicDataLibrary;
		serializedNodeObj.radius = this.radius;
		serializedNodeObj.x = this.getAbsolutePosition(this.ID).x;
		serializedNodeObj.y = this.getAbsolutePosition(this.ID).y;

		serializedNodeObj.referenceList = this.referenceList;
		serializedNodeObj.citedByNodeList = this.citedByNodeList;

		serializedNodeObj.suggestedCitedByNodeList = this.suggestedCitedByNodeList;
		serializedNodeObj.suggestedReferenceNodeList = this.suggestedReferenceNodeList;

		serializedNodeObj.siblingIDs = this.siblingIDs;
		serializedNodeObj.siblingCount = this.siblingCount;
		return JSON.stringify(serializedNodeObj);
	}
	this.importSerializedData = function(serializedData) {
		this.referenceList = serializedData.referenceList;
		this.citedByNodeList = serializedData.citedByNodeList;

		this.suggestedCitedByNodeList =  serializedData.suggestedCitedByNodeList;
		this.suggestedReferenceNodeList = serializedData.suggestedReferenceNodeList;

		this.siblingIDs = serializedData.siblingIDs;
		this.siblingCount = serializedData.siblingCount;
	}
	this.getSuggestedCitedByCount = function() {
		return this.suggestedCitedByNodeList.length;
	}
	this.getSuggestedReferenceCount = function() {
		return this.suggestedReferenceNodeList.length;
	}
	this.isSuggestedNode = function(nodeID) {
		const isSuggestedCitedBy = (this.suggestedCitedByNodeList.indexOf(nodeID) > -1);
		if(isSuggestedCitedBy) return true;
		else return (this.suggestedReferenceNodeList.indexOf(nodeID) > -1);
	}
	this.suggestCitedBy = function(citedByID) {
		this.suggestedCitedByNodeList.push(citedByID);
	}
	this.suggestReference = function(referenceID) {
		this.suggestedReferenceNodeList.push(referenceID);
	}
	this.removeCitedBySuggestion = function(citedByID) {
		const indexOfNode = this.suggestedCitedByNodeList.indexOf(citedByID);
		this.suggestedCitedByNodeList.splice(indexOfNode, 1); 
	}
	this.removeReferenceSuggestion = function(referenceID) {
		const indexOfNode = this.suggestedReferenceNodeList.indexOf(referenceID);
		this.suggestedReferenceNodeList.splice(indexOfNode, 1); 
	}
	this.getCitationNodeList = function() {
		return this.citedByNodeList;
	}
	this.getReferenceNodeList = function() {
		return this.referenceList;
	}
	this.getSuggestedCitedByList = function() {
		return this.suggestedCitedByNodeList;
	}
	this.getSuggestedReferenceList = function() {
		return this.suggestedReferenceNodeList;
	}
	RootNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(RootNode.prototype, 'constructor', { 
	    value: RootNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}