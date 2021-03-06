var visualizerModule = (function() {
	var stage;
	var layer;

	var nodeConnectionsConfig = {
		citedByAbsoluteStartDegree: 280,
		citedByAbsoluteEndDegree: 80,
		referenceAbsoluteStartDegree: 120,
		referenceAbsoluteEndDegree: 240,
		connectionLength: 50,
		maxConnectionPerLayer: 10
	};

	var updateScene = function() {
		stage.batchDraw();
	};

	var getCircleFromNode = function(group) {
		return group.findOne("Circle");
	};

	var createCircle = function(
		x,
		y,
		r,
		domId,
		isDraggable,
		mouseOverCallback,
		mouseOutCallback,
		callbackReturnObject,
		dragstartCallback,
		dragendCallback,
		clickedCallback
	) {
		var circle = new Konva.Circle({
			x: x,
			y: y,
			radius: r,
			fill: "blue",
			stroke: "black",
			strokeWidth: 4,
			id: domId,
			draggable: isDraggable
		});

		circle.on("mouseover", function() {
			mouseOverCallback(callbackReturnObject, domId);
		});
		circle.on("mouseout", function() {
			mouseOutCallback(callbackReturnObject, domId);
		});
		circle.on("dragstart", function() {
			dragstartCallback(callbackReturnObject, domId);
		});
		circle.on("dragend", function() {
			dragendCallback(callbackReturnObject, domId);
		});
		circle.on("click", function(evt) {
			clickedCallback(callbackReturnObject, domId);
		});
		return circle;
	};

	var createConnection = function(x1, y1, x2, y2) {
		var line = new Konva.Line({
			points: [x1, y1, x2, y2],
			stroke: "black",
			strokeWidth: 3,
			lineCap: "round",
			lineJoin: "round"
		});
		return line;
	};

	//Public Functions
	var initializeModule = function(
		konvaDivID,
		w,
		h,
		newConnectionsConfig,
		stageClickedCallback
	) {
		stage = new Konva.Stage({
			container: konvaDivID,
			width: w,
			height: h
		});

		layer = new Konva.Layer();
		stage.add(layer);

		stage.on("click", function(evt) {
			var shape = evt.target;
			stageClickedCallback(evt.target.className);
		});

		nodeConnectionsConfig = newConnectionsConfig;
	};

	var createRootNode = function(
		radius,
		x,
		y,
		rootId,
		isDraggable,
		mouseOverCallback,
		mouseOutCallback,
		rootNodeObject,
		dragstartCallback,
		dragendCallback,
		clickedCallback
	) {
		var circle = new Konva.Circle({
			x: x,
			y: y,
			radius: radius,
			fill: "red",
			stroke: "black",
			strokeWidth: 4,
			id: rootId,
			draggable: isDraggable
		});

		circle.on("mouseover", function() {
			mouseOverCallback(rootNodeObject, rootId);
		});
		circle.on("mouseout", function() {
			mouseOutCallback(rootNodeObject, rootId);
		});
		circle.on("dragstart", function() {
			dragstartCallback(rootNodeObject, rootId);
		});
		circle.on("dragend", function() {
			dragendCallback(rootNodeObject, rootId);
		});
		circle.on("click", function(evt) {
			clickedCallback(rootNodeObject, rootId);
		});

		layer.add(circle);
		updateScene();
		return circle;
	};

	var calculateReferenceAngleAndLength = function(rootNode, referenceNumber) {
		const maxNodeCountPerLayer = nodeConnectionsConfig.maxConnectionPerLayer;
		const layerIndex = Math.floor(referenceNumber / maxNodeCountPerLayer);

		const absoluteStartDegree =
			nodeConnectionsConfig.referenceAbsoluteStartDegree;
		const absoluteEndDegree = nodeConnectionsConfig.referenceAbsoluteEndDegree;

		const degreePerNode =
			(absoluteEndDegree - absoluteStartDegree) / maxNodeCountPerLayer;
		const nodeIndex = referenceNumber % maxNodeCountPerLayer;

		const nodeDegree = absoluteStartDegree + degreePerNode * nodeIndex;
		const connectionUnitLength = nodeConnectionsConfig.connectionLength;
		const nodeConnectionLength =
			connectionUnitLength + connectionUnitLength * layerIndex;

		return {
			nodeDegree: nodeDegree,
			nodeConnectionLength: nodeConnectionLength
		};
	};

	var calculateCitedByAngleAndLength = function(rootNode, citedByNumber) {
		const maxNodeCountPerLayer = nodeConnectionsConfig.maxConnectionPerLayer;
		const layerIndex = Math.floor(citedByNumber / maxNodeCountPerLayer);

		const absoluteStartDegree =
			nodeConnectionsConfig.citedByAbsoluteStartDegree;
		const absoluteEndDegree = nodeConnectionsConfig.citedByAbsoluteEndDegree;

		const degreePerNode =
			(360 - absoluteStartDegree + absoluteEndDegree) / maxNodeCountPerLayer;
		const nodeIndex = citedByNumber % maxNodeCountPerLayer;

		const nodeDegree = absoluteStartDegree + degreePerNode * nodeIndex;
		const connectionUnitLength = nodeConnectionsConfig.connectionLength;
		const nodeConnectionLength =
			connectionUnitLength + connectionUnitLength * layerIndex;

		return {
			nodeDegree: nodeDegree,
			nodeConnectionLength: nodeConnectionLength
		};
	};

	var calculateLeafNodeCoordinateAroundRootNode = function(
		rootNode,
		angle,
		length,
		radius
	) {
		var rootCircle = rootNode;
		angle = -angle;

		var rootCircleAbsolutePosition = rootCircle.getAbsolutePosition();
		var rootCircleCenter = {
			x: rootCircleAbsolutePosition.x - stage.x(),
			y: rootCircleAbsolutePosition.y - stage.y()
		};
		var rootCircleRadius = rootCircle.radius();

		var leafShapeRadius = radius;
		var lineLength = rootCircleRadius + length + leafShapeRadius; //hypotenuse

		var angleInRadian = (angle * Math.PI) / 180;
		var dY = lineLength * Math.sin(angleInRadian);
		var dX = lineLength * Math.cos(angleInRadian);

		var nx = rootCircleCenter.x + dX;
		var ny = rootCircleCenter.y + dY;

		return {
			x: nx,
			y: ny
		};
	};

	var setCitedByPosition = function(
		rootVisualObj,
		leafVisualObj,
		position,
		leafRadius
	) {
		var calculation = calculateCitedByAngleAndLength(rootVisualObj, position);
		var newPos = calculateLeafNodeCoordinateAroundRootNode(
			rootVisualObj,
			calculation.nodeDegree,
			calculation.nodeConnectionLength,
			leafRadius
		);
		leafVisualObj.position({
			x: newPos.x,
			y: newPos.y
		});

		var rootCircleAbsolutePosition = rootVisualObj.getAbsolutePosition();
		var rootCircleCenter = {
			x: rootCircleAbsolutePosition.x - stage.x(),
			y: rootCircleAbsolutePosition.y - stage.y()
		};

		leafVisualObj.connection.destroy();
		leafVisualObj.connection = createConnection(
			rootCircleCenter.x,
			rootCircleCenter.y,
			newPos.x,
			newPos.y
		);

		layer.add(leafVisualObj.connection);
		leafVisualObj.connection.moveToBottom();
		updateScene();
	};

	var setReferencePosition = function(
		rootVisualObj,
		leafVisualObj,
		position,
		leafRadius
	) {
		var calculation = calculateReferenceAngleAndLength(rootVisualObj, position);
		var newPos = calculateLeafNodeCoordinateAroundRootNode(
			rootVisualObj,
			calculation.nodeDegree,
			calculation.nodeConnectionLength,
			leafRadius
		);
		leafVisualObj.position({
			x: newPos.x,
			y: newPos.y
		});

		var rootCircleAbsolutePosition = rootVisualObj.getAbsolutePosition();
		var rootCircleCenter = {
			x: rootCircleAbsolutePosition.x - stage.x(),
			y: rootCircleAbsolutePosition.y - stage.y()
		};

		leafVisualObj.connection.destroy();
		leafVisualObj.connection = createConnection(
			rootCircleCenter.x,
			rootCircleCenter.y,
			newPos.x,
			newPos.y
		);

		layer.add(leafVisualObj.connection);
		leafVisualObj.connection.moveToBottom();
		updateScene();
	};

	var createLeafNode = function(
		rootNode,
		angle,
		length,
		nodeId,
		radius,
		isDraggable,
		mouseOverCallback,
		mouseOutCallback,
		callbackReturnObject,
		dragstartCallback,
		dragendCallback,
		clickedCallback
	) {
		var leafPos = calculateLeafNodeCoordinateAroundRootNode(
			rootNode,
			angle,
			length,
			radius
		);
		var rootCircle = rootNode;

		var leafShapeRadius = radius;
		var rootCircleAbsolutePosition = rootCircle.getAbsolutePosition();
		var rootCircleCenter = {
			x: rootCircleAbsolutePosition.x - stage.x(),
			y: rootCircleAbsolutePosition.y - stage.y()
		};

		var leafCircle = createCircle(
			leafPos.x,
			leafPos.y,
			leafShapeRadius,
			nodeId,
			isDraggable,
			mouseOverCallback,
			mouseOutCallback,
			callbackReturnObject,
			dragstartCallback,
			dragendCallback,
			clickedCallback
		);
		leafCircle.connection = createConnection(
			rootCircleCenter.x,
			rootCircleCenter.y,
			leafPos.x,
			leafPos.y
		);

		layer.add(leafCircle.connection);
		leafCircle.connection.moveToBottom();
		layer.add(leafCircle);
		updateScene();
		return leafCircle;
	};

	var createReferenceNode = function(
		rootNode,
		referenceNumber,
		nodeId,
		radius,
		mouseOverCallback,
		mouseOutCallback,
		callbackReturnObject,
		dragstartCallback,
		dragendCallback,
		clickedCallback
	) {
		var calculation = calculateReferenceAngleAndLength(
			rootNode,
			referenceNumber
		);

		const isDraggable = true;
		return createLeafNode(
			rootNode,
			calculation.nodeDegree,
			calculation.nodeConnectionLength,
			nodeId,
			radius,
			isDraggable,
			mouseOverCallback,
			mouseOutCallback,
			callbackReturnObject,
			dragstartCallback,
			dragendCallback,
			clickedCallback
		);
	};

	var createCitedByNode = function(
		rootNode,
		citedByNumber,
		nodeId,
		radius,
		mouseOverCallback,
		mouseOutCallback,
		callbackReturnObject,
		dragstartCallback,
		dragendCallback,
		clickedCallback
	) {
		var calculation = calculateCitedByAngleAndLength(rootNode, citedByNumber);

		const isDraggable = true;
		return createLeafNode(
			rootNode,
			calculation.nodeDegree,
			calculation.nodeConnectionLength,
			nodeId,
			radius,
			isDraggable,
			mouseOverCallback,
			mouseOutCallback,
			callbackReturnObject,
			dragstartCallback,
			dragendCallback,
			clickedCallback
		);
	};

	var getNodeById = function(nodeID) {
		return stage.findOne("#" + nodeID);
	};

	var getNodeCenterById = function(nodeID) {
		var nodeCenterPos = stage.findOne("#" + nodeID).getAbsolutePosition();
		return { x: nodeCenterPos.x - stage.x(), y: nodeCenterPos.y - stage.y() };
	};

	var getNodeRadiusById = function(nodeID) {
		return stage.findOne("#" + nodeID).radius();
	};
	var removeVisualObject = function(visualObject) {
		if (visualObject.connection) visualObject.connection.destroy();
		visualObject.destroy();
	};

	var removeVisualObject = function(visualObject) {
		if (visualObject.connection) visualObject.connection.destroy();
		visualObject.destroy();
	};

	var connectVisualObjectsByID = function(ID1, ID2) {
		var nodeCenterPos1 = getNodeCenterById(ID1);
		var nodeCenterPos2 = getNodeCenterById(ID2);

		var connection = createConnection(
			nodeCenterPos1.x,
			nodeCenterPos1.y,
			nodeCenterPos2.x,
			nodeCenterPos2.y
		);
		layer.add(connection);
		connection.moveToBottom();
		updateScene();
		return connection;
	};
	var changeFillColorOfVisualObject = function(visualObject, color) {
		visualObject.fill(color);
		updateScene();
	};
	var setPosition = function(visualObject, x, y) {
		visualObject.position({
			x: x,
			y: y
		});
		updateScene();
	};
	var setOpacity = function(visualObject, opacity) {
		visualObject.opacity(opacity);
		updateScene();
	};

	var setStrokeColor = function(visualObjID, color) {
		var visualObject = getNodeById(visualObjID);
		visualObject.stroke(color);
	};

	var moveCanvas = function(x, y) {
		stage.move({
			x: x,
			y: y
		});
		updateScene();
	};

	var getCanvasPos = function() {
		return { x: stage.x(), y: stage.y() };
	};
	var destroy = function() {
		stage.destroy();
	};
	var moveObject = function(visualObject, x, y) {
		visualObject.move({
			x: x,
			y: y
		});
		updateScene();
	};
	var setPositionOnCamera = function(visualObject, x, y) {
		const canvasPos = getCanvasPos();
		visualObject.position({
			x: x - canvasPos.x,
			y: y - canvasPos.y
		});
	};
	return {
		initializeModule: initializeModule,
		createRootNode: createRootNode,
		createLeafNode: createLeafNode,
		createReferenceNode: createReferenceNode,
		createCitedByNode: createCitedByNode,
		getNodeById: getNodeById,
		getNodeCenterById: getNodeCenterById,
		getNodeRadiusById: getNodeRadiusById,

		getCanvasPos: getCanvasPos,
		moveCanvas: moveCanvas,
		setOpacity: setOpacity,
		setStrokeColor: setStrokeColor,
		setPosition: setPosition,
		changeFillColorOfVisualObject: changeFillColorOfVisualObject,
		connectVisualObjectsByID: connectVisualObjectsByID,
		updateCanvas: updateScene,

		removeVisualObject: removeVisualObject,
		destroy: destroy,
		moveObject: moveObject,
		setPositionOnCamera: setPositionOnCamera,

		setCitedByPosition: setCitedByPosition,
		setReferencePosition: setReferencePosition
	};
})();
