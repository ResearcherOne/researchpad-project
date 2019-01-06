var visualizerModule = (function () {
	var stage;
	var layer;

	var updateScene = function() {
		layer.batchDraw();
	}

	var getCircleFromNode = function(group) {
		return group.findOne('Circle');
	}

	var createCircle = function(x, y, r, domId, mouseOverCallback, mouseOutCallback) {
		console.log(domId);
		var circle = new Konva.Circle({
			x: x,
			y: y,
			radius: r,
			fill: 'black',
			stroke: 'blue',
			strokeWidth: 4,
			id: domId
		});

		circle.on('mouseover', function () {
			mouseOverCallback(domId);
		});
		circle.on('mouseout', function () {
			mouseOutCallback(domId);
		});
		return circle;
	}

	var addConnection = function(firstShape, secondShape) {
		var firstAbsolutePosition = firstShape.getAbsolutePosition();
		var secondAbsolutePosition = secondShape.getAbsolutePosition();
		var firstCenter = {"x": (firstAbsolutePosition.x), "y":(firstAbsolutePosition.y)};
		var secondCenter = {"x": (secondAbsolutePosition.x), "y":(secondAbsolutePosition.y)};

		var line = new Konva.Line({
		points: [firstCenter.x, firstCenter.y, secondCenter.x, secondCenter.y],
		stroke: 'black',
		strokeWidth: 3,
		lineCap: 'round',
		lineJoin: 'round'
		});

		layer.add(line);
		line.moveToBottom();
	}


  //Public Functions
	var initializeModule = function(konvaDivID) {
		var w = window.innerWidth;
		var h = window.innerHeight;

		stage = new Konva.Stage({
			container: konvaDivID,
			width: w,
			height: h
		});

		layer = new Konva.Layer();
		stage.add(layer);
	};

	var createRootNode = function(radius, x, y, rootId, mouseOverCallback, mouseOutCallback) {
		var circle = new Konva.Circle({
			x: x,
			y: y,
			radius: radius,
			fill: 'red',
			stroke: 'black',
			strokeWidth: 4,
			id: rootId
		});

		circle.on('mouseover', function () {
			mouseOverCallback(rootId);
		});
		circle.on('mouseout', function () {
			mouseOutCallback(rootId);
		});

		layer.add(circle);
		updateScene();
		return circle;
	}

	var createLeafNode = function(rootNode, angle, length, nodeId, radius, mouseOverCallback, mouseOutCallback) {
		var rootCircle = rootNode;
		angle = -angle;

		var rootCircleAbsolutePosition = rootCircle.getAbsolutePosition();
		var rootCircleCenter = {"x":  rootCircleAbsolutePosition.x, "y": rootCircleAbsolutePosition.y};
		var rootCircleRadius = rootCircle.radius();

		var leafShapeRadius = radius;
		var lineLength = rootCircleRadius + length + leafShapeRadius; //hypotenuse

		var angleInRadian = (angle * Math.PI)/180;
		var dY = lineLength * Math.sin(angleInRadian);
		var dX = lineLength * Math.cos(angleInRadian);

		var nx = rootCircleCenter.x + dX;
		var ny = rootCircleCenter.y + dY;

		var leafCircle = createCircle(nx, ny, leafShapeRadius, nodeId, mouseOverCallback, mouseOutCallback);
		addConnection(rootCircle, leafCircle)

		layer.add(leafCircle);
		updateScene();
		return leafCircle;
	}

	var createReferenceNode = function(rootNode, referenceNumber, nodeId, radius, mouseOverCallback, mouseOutCallback) {
		const maxNodeCountPerLayer = 10;
		const layerIndex = Math.floor(referenceNumber/maxNodeCountPerLayer);

		const absoluteStartDegree = 120;
		const absoluteEndDegree = 240;

		const degreePerNode = (absoluteEndDegree - absoluteStartDegree) / maxNodeCountPerLayer;
		const nodeIndex = referenceNumber % maxNodeCountPerLayer;

		const nodeDegree = absoluteStartDegree + degreePerNode * nodeIndex;
		const connectionUnitLength = 40;
		const nodeConnectionLength = connectionUnitLength + connectionUnitLength * layerIndex;

		return createLeafNode(rootNode, nodeDegree, nodeConnectionLength, nodeId, radius, mouseOverCallback, mouseOutCallback);
	}

	var createCitedByNode = function(rootNode, citedByNumber, nodeId, radius, mouseOverCallback, mouseOutCallback) {
		const maxNodeCountPerLayer = 10;
		const layerIndex = Math.floor(citedByNumber/maxNodeCountPerLayer);

		const absoluteStartDegree = 300;
		const absoluteEndDegree = 60;

		const degreePerNode = ((360 - absoluteStartDegree) + absoluteEndDegree) / maxNodeCountPerLayer;
		const nodeIndex = citedByNumber % maxNodeCountPerLayer;

		const nodeDegree = absoluteStartDegree + degreePerNode * nodeIndex;
		const connectionUnitLength = 40;
		const nodeConnectionLength = connectionUnitLength + connectionUnitLength * layerIndex;

		return createLeafNode(rootNode, nodeDegree, nodeConnectionLength, nodeId, radius, mouseOverCallback, mouseOutCallback);
	}

	var getNodeById = function(nodeID) {
		return stage.findOne('#'+nodeID);
	}

	var getNodeCenterById = function(nodeID) {
		var nodeCenterPos = stage.findOne('#'+nodeID).getAbsolutePosition();
		return {"x": nodeCenterPos.x, "y": nodeCenterPos.y};
	}

	var getNodeRadiusById = function(nodeID) {
		return stage.findOne('#'+nodeID).radius();
	}

	return {
		initializeModule: initializeModule,
		createRootNode: createRootNode,
		createLeafNode: createLeafNode,
		createReferenceNode: createReferenceNode,
		createCitedByNode: createCitedByNode,
		getNodeById: getNodeById,
		getNodeCenterById: getNodeCenterById,
		getNodeRadiusById: getNodeRadiusById
	}
})();