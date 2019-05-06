function LeafNode(ID, academicDataLibrary, isCitationNode) {
  Node.call(this, ID, academicDataLibrary);

  this.isCitationNode = isCitationNode;

  this.rootNodes = {};
  this.rootNodeCount = 0;

  var hideVisualObj = function(visualObject) {
    visualObject.to({ opacity: 0 });
    if (visualObject.connection) visualObject.connection.to({ opacity: 0 });
  };
  var showVisualObj = function(visualObject) {
    visualObject.to({ opacity: 1 });
    if (visualObject.connection) visualObject.connection.to({ opacity: 1 });
  };
  var updateLeafVisualObjPosition = function(
    rootVisualObj,
    leafVisualObj,
    position,
    leafRadius,
    isCitedBy
  ) {
    if (isCitedBy) {
      visualizerModule.setCitedByPosition(
        rootVisualObj,
        leafVisualObj,
        position,
        leafRadius
      );
    } else {
      visualizerModule.setReferencePosition(
        rootVisualObj,
        leafVisualObj,
        position,
        leafRadius
      );
    }
  };

  //Public
  this.getRootNodeID = function(visualObjID) {
    //visualObjID = this.ID + ROOT_ID
    const citedByIDLength = this.ID.length;
    const rootID = visualObjID.substring(citedByIDLength);
    return rootID;
  };
  this.connectRoot = function(
    rootID,
    rootVisualObj,
    radius,
    referencePosition,
    dragstartCallback,
    dragendCallback,
    mouseOverCallback,
    mouseOutCallback,
    clickedCallback
  ) {
    this.rootNodes[rootID] = {
      rootVisualObj: rootVisualObj,
      visualObj: null,
      radius: radius,
      position: referencePosition,
      isHidden: true,
      callback: {
        dragstart: dragstartCallback,
        dragend: dragendCallback,
        mouseOver: mouseOverCallback,
        mouseOut: mouseOutCallback,
        clicked: clickedCallback
      }
    };
    this.rootNodeCount++;
  };
  this.removeRootConnection = function(rootID) {
    const visualObj = this.rootNodes[rootID].visualObj;
    if (visualObj) visualizerModule.removeVisualObject(visualObj);
    delete this.rootNodes[rootID];
    this.rootNodeCount--;
  };
  this.getConnectionCount = function() {
    return this.rootNodeCount;
  };

  this.getRootNodeIdList = function() {
    return Object.keys(this.rootNodes);
  };

  this.setPositionForSuggestion = function(rootID, suggestionPosition) {
    const visualObj = this.rootNodes[rootID].visualObj;
    if (!visualObj) {
      const rootSpecificVisualObjID = this.ID + rootID;
      const rootNodeData = this.rootNodes[rootID];
      const rootVisualObj = rootNodeData.rootVisualObj;
      const radius = rootNodeData.radius;
      const mouseOverCallback = rootNodeData.callback.mouseOver;
      const mouseOutCallback = rootNodeData.callback.mouseOut;
      const dragstartCallback = rootNodeData.callback.dragstart;
      const dragendCallback = rootNodeData.callback.dragend;
      const clickedCallback = rootNodeData.callback.clicked;
      if (this.isCitationNode) {
        this.rootNodes[rootID].visualObj = visualizerModule.createCitedByNode(
          rootVisualObj,
          suggestionPosition,
          rootSpecificVisualObjID,
          radius,
          mouseOverCallback,
          mouseOutCallback,
          this,
          dragstartCallback,
          dragendCallback,
          clickedCallback
        );
      } else {
        this.rootNodes[rootID].visualObj = visualizerModule.createReferenceNode(
          rootVisualObj,
          suggestionPosition,
          rootSpecificVisualObjID,
          radius,
          mouseOverCallback,
          mouseOutCallback,
          this,
          dragstartCallback,
          dragendCallback,
          clickedCallback
        );
      }
    }
    const rootVisualObj = this.rootNodes[rootID].rootVisualObj;
    const leafRadius = this.rootNodes[rootID].radius;
    const leafVisualObj = this.rootNodes[rootID].visualObj;
    updateLeafVisualObjPosition(
      rootVisualObj,
      leafVisualObj,
      suggestionPosition,
      leafRadius,
      this.isCitationNode
    );
    hideVisualObj(leafVisualObj);
  };

  //this.removeSuggestion
  //destroy visualObj

  this.show = function(rootID) {
    if (this.rootNodes[rootID].visualObj)
      showVisualObj(this.rootNodes[rootID].visualObj);
  };

  this.hide = function(rootID) {
    if (this.rootNodes[rootID].visualObj)
      hideVisualObj(this.rootNodes[rootID].visualObj);
  };

  this.serialize = function() {
    var serializedObj = {};
    serializedObj.ID = this.ID;
    serializedObj.academicDataLibrary = this.academicDataLibrary;
    serializedObj.rootNodes = this.rootNodes; //serializing visualObj as well may not be a good idea.
    return JSON.stringify(serializedObj);
  };

  LeafNode.prototype = Object.create(Node.prototype);
  Object.defineProperty(LeafNode.prototype, "constructor", {
    value: LeafNode,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
  });
}
