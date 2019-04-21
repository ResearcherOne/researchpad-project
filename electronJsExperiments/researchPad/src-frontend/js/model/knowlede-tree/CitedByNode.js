function CitedByNode(rootNodeID, rootNodeVisualObj, ID, academicDataLibrary, radius, referencePosition, dragstartCallback, dragendCallback, mouseOverCallback, mouseOutCallback, clickedCallback) { //nodeMouseOverCallback, nodeMouseOutCallback
	Node.call(this, ID, academicDataLibrary, radius);

	this.rootNodeID = rootNodeID;
	this.referencePosition = referencePosition;

	var mouseOverLeafNode = function(referenceNodeObject, visualObjID) {
		if(mouseOverCallback) mouseOverCallback(referenceNodeObject, visualObjID);
	}

	var mouseOutLeafNode = function(referenceNodeObject, visualObjID) {
		if(mouseOutCallback) mouseOutCallback(referenceNodeObject, visualObjID);
	}
	this.getRootNodeID = function(visualObjID) { //visualObjID = this.ID + ROOT_ID
		const citedByIDLength = this.ID.length;
		const rootID = visualObjID.substring(citedByIDLength);
		return rootID;
	}

	const initialVisualObjID = this.ID + this.rootNodeID;
	this.visualObject = visualizerModule.createCitedByNode(rootNodeVisualObj, this.referencePosition, initialVisualObjID, this.radius, mouseOverLeafNode, mouseOutLeafNode, this, dragstartCallback, dragendCallback, clickedCallback);

	this.serialize = function() {
		var serializedObj = {};
		serializedObj.ID = this.ID;
		serializedObj.academicDataLibrary = this.academicDataLibrary;
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