var visualizerModule = (function () {
	var stage;
	var layer;

	var updateScene = function() {
		layer.batchDraw();
	}

	var getCircleFromNode = function(group) {
		return group.findOne('Circle');
	}

	var createCircle = function(x, y, r) {
		var circle = new Konva.Circle({
			x: x,
			y: y,
			radius: r,
			fill: 'black',
			stroke: 'blue',
			strokeWidth: 4
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
	var initializeModule = function() {
		var w = window.innerWidth;
		var h = window.innerHeight;

		stage = new Konva.Stage({
			container: 'container',
			width: w,
			height: h
		});

		layer = new Konva.Layer();
		stage.add(layer);
	};

	var createRootNode = function(text, x, y) { //This does not span at exact x,y. Be aware of that.
		var group = new Konva.Group({
		    x: x,
		    y: y
		});

		var complexText = new Konva.Text({
			x: x,
			y: y,
			text: text,
			fontSize: 18,
			fontFamily: 'Calibri',
			fill: '#555',
		});

		var textWidth = complexText.getWidth();
		var textHeight = complexText.getHeight();

		var circle = new Konva.Circle({
			x: x+(textWidth/2),
			y: y+(textHeight/2),
			radius: (textWidth*2)/3,
			fill: 'red',
			stroke: 'black',
			strokeWidth: 4
		});

		group.add(circle);
		group.add(complexText);
		layer.add(group);
		updateScene();
		return group;
	}

	var createLeafNode = function(rootNode, angle, length) {
		var rootCircle = getCircleFromNode(rootNode);
		angle = -angle;

		var rootCircleAbsolutePosition = rootCircle.getAbsolutePosition();
		var rootCircleCenter = {"x":  rootCircleAbsolutePosition.x, "y": rootCircleAbsolutePosition.y};
		var rootCircleRadius = rootCircle.radius();

		var leafShapeRadius = 10;
		var lineLength = rootCircleRadius + length + leafShapeRadius; //hypotenuse

		var angleInRadian = (angle * Math.PI)/180;
		var dY = lineLength * Math.sin(angleInRadian);
		var dX = lineLength * Math.cos(angleInRadian);

		var nx = rootCircleCenter.x + dX;
		var ny = rootCircleCenter.y + dY;

		var leafCircle = createCircle(nx, ny, leafShapeRadius);
		addConnection(rootCircle, leafCircle)

		layer.add(leafCircle);
		updateScene();
	}

	return {
		initializeModule: initializeModule,
		createRootNode: createRootNode,
		createLeafNode: createLeafNode
	}
})();