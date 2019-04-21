function ReferenceNode(rootNodeID, rootNodeVisualObj, ID, academicDataLibrary, radius, referencePosition, dragstartCallback, dragendCallback, mouseOver, mouseOut, clickedCallback) {
	Node.call(this, ID, academicDataLibrary, radius);

	this.rootNodeID = rootNodeID;
	this.referencePosition = referencePosition;

	var mouseOverLeafNode = function(referenceNodeObject, visualObjID) {
        if(mouseOver) mouseOver(referenceNodeObject, visualObjID);
        /*
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
        */
	}

	var mouseOutLeafNode = function(referenceNodeObject, visualObjID) {
        if(mouseOut) mouseOut(referenceNodeObject, visualObjID);
        /*
		document.body.style.cursor = 'default';
        overlayerModule.clearTitleOverlay();
        */
	}

	const initialVisualObjectID = this.ID + this.rootNodeID;
	this.visualObject = visualizerModule.createReferenceNode(rootNodeVisualObj, this.referencePosition, initialVisualObjectID, this.radius, mouseOverLeafNode, mouseOutLeafNode, this, dragstartCallback, dragendCallback, clickedCallback);

	this.getRootNodeID = function() {
		return this.rootNodeID;
	}

	this.serialize = function() {
		var serializedReferenceObj = {};
		serializedReferenceObj.ID = this.ID;
		serializedReferenceObj.academicDataLibrary = this.academicDataLibrary;
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
