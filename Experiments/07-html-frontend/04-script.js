/*
TODO
  Complete addLeafNode function using addCircle. Keep things simple. For now, there is no such thing as TextNode.
*/
function addCircleTextNode(layer, text, x, y) { //This does not span at exact x,y. Be aware of that.
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
    return group;
}

function createCirlce(x, y, r) {
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

function addConnection(layer, firstShape, secondShape) {
  //var firstShape = firstNode.findOne('Circle');
  //var secondShape = secondNode.findOne('Circle');
  
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

function addLeafNode(layer, rootShape, angle, length) {
  angle = - angle;
  var rootShapeAbsolutePosition = rootShape.getAbsolutePosition();
  var rootShapeCenter = {"x": (rootShapeAbsolutePosition.x), "y":(rootShapeAbsolutePosition.y)};
  var rootShapeRadius = rootShape.radius();

  var leafShapeRadius = 10;
  var lineLength = rootShapeRadius + length + leafShapeRadius; //hypotenuse

  var angleInRadian = (angle * Math.PI)/180;
  var dY = lineLength * Math.sin(angleInRadian);
  var dX = lineLength * Math.cos(angleInRadian);

  var nx = rootShapeCenter.x + dX;
  var ny = rootShapeCenter.y + dY;


  var circle = createCirlce(nx, ny, leafShapeRadius);
  layer.add(circle);
  addConnection(layer, rootShape, circle);


}

function getShapeFromGroup(group) {
  return group.findOne('Circle');
}

function initializeScript() {
  //var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  //var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	var w = window.innerWidth;
  var h = window.innerHeight;
  
  var stage = new Konva.Stage({
      container: 'container',
      width: w,
      height: h
    });

    var layer = new Konva.Layer();
    
    var node1 = addCircleTextNode(layer, "Root Node", 200, 200);
    var shape1 = getShapeFromGroup(node1);

    for(var i = 0; i <= 360; i = i + 10) {
      const length = i;
      const angle = i;
      addLeafNode(layer, shape1, angle, length);
    }

  stage.add(layer);
}

document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");
    initializeScript();
 });