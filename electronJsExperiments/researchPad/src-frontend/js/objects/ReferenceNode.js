function ReferenceNode(rootNodeID, rootNodeVisualObj, ID, metadata, radius, referencePosition, dragstartCallback, dragendCallback, mouseOver, mouseOut) {
	Node.call(this, ID, metadata, radius);

	this.rootNodeID = rootNodeID;
	this.referencePosition = referencePosition;

	var mouseOverLeafNode = function(referenceNodeObject) {
        if(mouseOver) mouseOver(referenceNodeObject);
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

	var mouseOutLeafNode = function(referenceNodeObject) {
        if(mouseOut) mouseOut(referenceNodeObject);
        /*
		document.body.style.cursor = 'default';
        overlayerModule.clearTitleOverlay();
        */
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
