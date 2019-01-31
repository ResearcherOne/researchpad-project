var visualizerModule = (function () {
	var stage;
	var layer;

	var updateScene = function() {
		//layer.batchDraw();
		stage.batchDraw();
	}

	var getCircleFromNode = function(group) {
		return group.findOne('Circle');
	}

	var createCircle = function(x, y, r, domId, isDraggable, mouseOverCallback, mouseOutCallback, callbackReturnObject, dragstartCallback, dragendCallback) {
		var circle = new Konva.Circle({
			x: x,
			y: y,
			radius: r,
			fill: 'blue',
			stroke: 'black',
			strokeWidth: 4,
			id: domId,
			draggable: isDraggable
		});

		circle.on('mouseover', function () {
			mouseOverCallback(callbackReturnObject);
		});
		circle.on('mouseout', function () {
			mouseOutCallback(callbackReturnObject);
		});
		circle.on('dragstart', function () {
			dragstartCallback(callbackReturnObject);
		});
		circle.on('dragend', function () {
			dragendCallback(callbackReturnObject);
		});
		return circle;
	}

	var createConnection = function(x1, y1, x2, y2) {
		var line = new Konva.Line({
		points: [x1, y1, x2, y2],
		stroke: 'black',
		strokeWidth: 3,
		lineCap: 'round',
		lineJoin: 'round'
		});
		return line;
	}


  //Public Functions
	var initializeModule = function(konvaDivID, w, h) {
		stage = new Konva.Stage({
			container: konvaDivID,
			width: w,
			height: h
		});

		layer = new Konva.Layer();
		stage.add(layer);
	};

	var createRootNode = function(radius, x, y, rootId, mouseOverCallback, mouseOutCallback, rootNodeObject, dragstartCallback, dragendCallback) {
		var circle = new Konva.Circle({
			x: x,
			y: y,
			radius: radius,
			fill: 'red',
			stroke: 'black',
			strokeWidth: 4,
			id: rootId,
			draggable: false
		});

		circle.on('mouseover', function () {
			mouseOverCallback(rootNodeObject);
		});
		circle.on('mouseout', function () {
			mouseOutCallback(rootNodeObject);
		});
		circle.on('dragstart', function () {
			dragstartCallback(rootNodeObject);
		});
		circle.on('dragend', function () {
			dragendCallback(rootNodeObject);
		});

		layer.add(circle);
		updateScene();
		return circle;
	}

	var createLeafNode = function(rootNode, angle, length, nodeId, radius, isDraggable, mouseOverCallback, mouseOutCallback, callbackReturnObject, dragstartCallback, dragendCallback) {
		var rootCircle = rootNode;
		angle = -angle;

		var rootCircleAbsolutePosition = rootCircle.getAbsolutePosition();
		var rootCircleCenter = {"x":  rootCircleAbsolutePosition.x-stage.x(), "y": rootCircleAbsolutePosition.y-stage.y()};
		var rootCircleRadius = rootCircle.radius();

		var leafShapeRadius = radius;
		var lineLength = rootCircleRadius + length + leafShapeRadius; //hypotenuse

		var angleInRadian = (angle * Math.PI)/180;
		var dY = lineLength * Math.sin(angleInRadian);
		var dX = lineLength * Math.cos(angleInRadian);

		var nx = rootCircleCenter.x + dX;
		var ny = rootCircleCenter.y + dY;

		var leafCircle = createCircle(nx, ny, leafShapeRadius, nodeId, isDraggable, mouseOverCallback, mouseOutCallback, callbackReturnObject, dragstartCallback, dragendCallback);
		leafCircle.connection = createConnection(rootCircleCenter.x, rootCircleCenter.y, nx, ny);

		layer.add(leafCircle.connection);
		leafCircle.connection.moveToBottom();
		layer.add(leafCircle);
		updateScene();
		return leafCircle;
	}

	var createReferenceNode = function(rootNode, referenceNumber, nodeId, radius, mouseOverCallback, mouseOutCallback, callbackReturnObject, dragstartCallback, dragendCallback) {
		const maxNodeCountPerLayer = 10;
		const layerIndex = Math.floor(referenceNumber/maxNodeCountPerLayer);

		const absoluteStartDegree = 120;
		const absoluteEndDegree = 240;

		const degreePerNode = (absoluteEndDegree - absoluteStartDegree) / maxNodeCountPerLayer;
		const nodeIndex = referenceNumber % maxNodeCountPerLayer;

		const nodeDegree = absoluteStartDegree + degreePerNode * nodeIndex;
		const connectionUnitLength = 40;
		const nodeConnectionLength = connectionUnitLength + connectionUnitLength * layerIndex;

		const isDraggable = true;
		return createLeafNode(rootNode, nodeDegree, nodeConnectionLength, nodeId, radius, isDraggable, mouseOverCallback, mouseOutCallback, callbackReturnObject, dragstartCallback, dragendCallback);
	}

	var createCitedByNode = function(rootNode, citedByNumber, nodeId, radius, mouseOverCallback, mouseOutCallback, callbackReturnObject, dragstartCallback, dragendCallback) {
		const maxNodeCountPerLayer = 10;
		const layerIndex = Math.floor(citedByNumber/maxNodeCountPerLayer);

		const absoluteStartDegree = 300;
		const absoluteEndDegree = 60;

		const degreePerNode = ((360 - absoluteStartDegree) + absoluteEndDegree) / maxNodeCountPerLayer;
		const nodeIndex = citedByNumber % maxNodeCountPerLayer;

		const nodeDegree = absoluteStartDegree + degreePerNode * nodeIndex;
		const connectionUnitLength = 40;
		const nodeConnectionLength = connectionUnitLength + connectionUnitLength * layerIndex;

		const isDraggable = true;
		return createLeafNode(rootNode, nodeDegree, nodeConnectionLength, nodeId, radius, isDraggable, mouseOverCallback, mouseOutCallback, callbackReturnObject, dragstartCallback, dragendCallback);
	}

	var getNodeById = function(nodeID) {
		return stage.findOne('#'+nodeID);
	}

	var getNodeCenterById = function(nodeID) {
		var nodeCenterPos = stage.findOne('#'+nodeID).getAbsolutePosition();
		return {"x": nodeCenterPos.x-stage.x(), "y": nodeCenterPos.y-stage.y()};
	}

	var getNodeRadiusById = function(nodeID) {
		return stage.findOne('#'+nodeID).radius();
	}
	/* For some weird reason visualObject.getAbsolutePosition(); returns dummy node's coordinates
	var getPositionOfVisualObject = function(visualObject) {
		var visualObjectPos = visualObject.getAbsolutePosition();
		console.log("visual object absolute pos info "+JSON.stringify(visualObjectPos));
		var stageX = stage.x();
		var stageY = stage.y();
		return {"x": visualObjectPos.x-stageX, "y": visualObjectPos.y-stageY};
	}
	*/
	var removeVisualObject = function(visualObject) {
		if(visualObject.connection) visualObject.connection.destroy();
		visualObject.destroy();
	}

	var removeVisualObject = function(visualObject) {
		if(visualObject.connection) visualObject.connection.destroy();
		visualObject.destroy();
	}

	var connectVisualObjectsByID = function(ID1, ID2) {
		var nodeCenterPos1 = getNodeCenterById(ID1);
		var nodeCenterPos2 = getNodeCenterById(ID2);

		var connection = createConnection(nodeCenterPos1.x, nodeCenterPos1.y, nodeCenterPos2.x, nodeCenterPos2.y);
		layer.add(connection);
		connection.moveToBottom();
		updateScene();
		return connection;
	}
	/*
	var createPlaceholderVisualObject = function(visualObject) {
		var placeholder = visualObject.clone({opacity: 0.5});
		layer.add(placeholder);
		updateScene();
		return placeholder;
	}
	*/
	var changeFillColorOfVisualObject = function(visualObject, color) {
		visualObject.fill(color);
		updateScene();
	}
	var setPosition = function(visualObject, x, y) {
		visualObject.position({
			x: x,
			y: y
		});
		updateScene();
	}
	var setOpacity = function(visualObject, opacity) {
		visualObject.opacity(opacity);
		updateScene();
	}
	var moveCanvas = function(x, y) {
		stage.move({
			x: x,
			y: y
		});
		updateScene();
	}
	var getMousePosOnCanvas = function(){
		return {x: stage.getPointerPosition().x, y: stage.getPointerPosition().y};
	}
	var getCanvasPos = function() {
		return {x: stage.x(), y: stage.y()};
	}
	return {
		initializeModule: initializeModule,
		createRootNode: createRootNode,
		createLeafNode: createLeafNode,
		createReferenceNode: createReferenceNode,
		createCitedByNode: createCitedByNode,
		getNodeById: getNodeById,
		getNodeCenterById: getNodeCenterById,
		getNodeRadiusById: getNodeRadiusById,

		//createPlaceholderVisualObject: createPlaceholderVisualObject,
		getCanvasPos: getCanvasPos,
		getMousePosOnCanvas: getMousePosOnCanvas,
		moveCanvas: moveCanvas,
		setOpacity: setOpacity,
		setPosition: setPosition,
		changeFillColorOfVisualObject: changeFillColorOfVisualObject,
		connectVisualObjectsByID: connectVisualObjectsByID,		
		//getPositionOfVisualObject: getPositionOfVisualObject,
		removeVisualObject: removeVisualObject
	}
})();