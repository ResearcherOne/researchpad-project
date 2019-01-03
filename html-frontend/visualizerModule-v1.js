var visualizerModule = (function () {
	var stage;
	var layer;

	var updateScene = function() {
		layer.batchDraw();
	}

	var getCircleFromNode = function(group) {
		return group.findOne('Circle');
	}

	var createNode = function(x, y, r) {
		var group = new Konva.Group({
			x: x,
			y: y
		});
		var circle = new Konva.Circle({
			x: x,
			y: y,
			radius: r,
			fill: 'black',
			stroke: 'red',
			strokeWidth: 4
		});
		group.add(circle);
		return group;
	}

	function createCircle(x, y, r) {
		var circle = new Konva.Circle({
			x: x,
			y: y,
			radius: r,
			fill: 'black',
			stroke: 'red',
			strokeWidth: 4
		});
		return circle;
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

		var leafNode = createNode(nx, ny, leafShapeRadius);
		//addConnection(layer, rootCircle, leafNode);
		var leafCircle = createCircle(nx, ny, leafShapeRadius);

		layer.add(leafNode);
		layer.add(leafCircle);
		updateScene();
	}

	return {
		initializeModule: initializeModule,
		createRootNode: createRootNode,
		createLeafNode: createLeafNode
	}
})();