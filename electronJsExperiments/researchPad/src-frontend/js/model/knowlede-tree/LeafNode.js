function LeafNode(ID, academicDataLibrary, isCitationNode) {
	Node.call(this, ID, academicDataLibrary);

    this.isCitationNode = isCitationNode;

	this.rootNodes = {};
    this.rootNodeCount = 0;
    
    var hideVisualObj = function(visualObject) {
        visualObject.to({opacity: 0});
        if(visualObject.connection) visualObject.connection.to({opacity: 0});
    }
    var showVisualObj = function(visualObject) {
        visualObject.to({opacity: 1});
		if(visualObject.connection) visualObject.connection.to({opacity: 1});
    }
    var updateLeafVisualObjPosition = function(rootVisualObj, leafVisualObj, position, leafRadius, isCitedBy) {
        if(isCitedBy) {
            visualizerModule.setCitedByPosition(rootVisualObj, leafVisualObj, position, leafRadius);
        } else {
            visualizerModule.setReferencePosition(rootVisualObj, leafVisualObj, position, leafRadius);
        }
    }

    //Public
	this.getRootNodeID = function(visualObjID) { //visualObjID = this.ID + ROOT_ID
		const citedByIDLength = this.ID.length;
		const rootID = visualObjID.substring(citedByIDLength);
		return rootID;
	}
	this.connectRoot = function(rootID, rootVisualObj, radius, referencePosition, dragstartCallback, dragendCallback, mouseOverCallback, mouseOutCallback, clickedCallback) {
		const rootSpecificVisualObjID = this.ID + rootID;
		const rootSpecificVisualObj = visualizerModule.createCitedByNode(rootVisualObj, referencePosition, rootSpecificVisualObjID, radius, mouseOverCallback, mouseOutCallback, this, dragstartCallback, dragendCallback, clickedCallback);
        hideVisualObj(rootSpecificVisualObj);
        this.rootNodes[rootID] = {
            rootVisualObj: rootVisualObj,
			visualObj: rootSpecificVisualObj,
			radius: radius,
            position: referencePosition,
            isHidden: true
		};
		this.rootNodeCount++;
	};
	this.removeRootConnection = function(rootID) {
		const visualObj = this.rootNodes[rootID].visualObj;
		visualizerModule.removeVisualObject(visualObj);
		delete this.rootNodes[rootID];
		this.rootNodeCount--;
	};
	this.getConnectionCount = function() {
		return this.rootNodeCount;
    };
    
    this.getRootNodeIdList = function() {
        return Object.keys(this.rootNodes)
    }

    this.setPosition = function(rootID, suggestionPosition) {
        const rootVisualObj = this.rootNodes[rootID].rootVisualObj;
        const leafRadius = this.rootNodes[rootID].radius;
        const leafVisualObj = this.rootNodes[rootID].visualObj;
        updateLeafVisualObjPosition(rootVisualObj, leafVisualObj, suggestionPosition, leafRadius, this.isCitationNode);
        hideVisualObj(leafVisualObj);
    }

    this.show = function(rootID) {
        showVisualObj(this.rootNodes[rootID].visualObj);
    }

    this.hide = function(rootID) {
        hideVisualObj(this.rootNodes[rootID].visualObj);
    }

	this.serialize = function() {
		var serializedObj = {};
		serializedObj.ID = this.ID;
		serializedObj.academicDataLibrary = this.academicDataLibrary;
		serializedObj.rootNodes = this.rootNodes; //serializing visualObj as well may not be a good idea.
		return JSON.stringify(serializedObj);
	}

	LeafNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(LeafNode.prototype, 'constructor', { 
	    value: LeafNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}