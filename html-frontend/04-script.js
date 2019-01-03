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

function addCircle(layer, x, y, r) {
  var circle = new Konva.Circle({
    x: x,
    y: y,
    radius: r,
    fill: 'red',
    stroke: 'black',
    strokeWidth: 4
  });
  layer.add(circle);
}

function addConnection(layer, firstNode, secondNode) {
  var firstShape = firstNode.findOne('Circle');
  var secondShape = secondNode.findOne('Circle');
  
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

function addLeafNode(layer, rootNode, leafNode, angle, length) {
  var rootShape = rootNode.findOne('Circle');
  var rootShapeAbsolutePosition = rootShape.getAbsolutePosition();
  var rootShapeCenter = {"x": (rootShapeAbsolutePosition.x), "y":(rootShapeAbsolutePosition.y)};
  var rootShapeRadius = rootShape.radius();

  var leafShape = leafNode.findOne('Circle');
  var leafShapeRadius = leafShape.radius();

  var lineLength = rootShapeRadius + length + leafShapeRadius; //hypotenuse

  var angleInRadian = (angle * Math.PI)/180;
  var dY = lineLength * Math.sin(angleInRadian);
  var dX = lineLength * Math.cos(angleInRadian);

  var nx = rootShapeCenter.x + dX;
  var ny = rootShapeCenter.y + dY;

  //alert("Center X: "+rootShapeCenter.x+" Center Y: "+rootShapeCenter.y);
  //alert("Leaf X: "+nx+" Leaf Y: "+ny);

  leafNode.setAbsolutePosition({"x":nx, "y":ny});
  addConnection(layer, rootNode, leafNode);


  var circle = new Konva.Circle({
      x: nx,
      y: ny,
      radius: 10,
      fill: 'black',
      stroke: 'black',
      strokeWidth: 4
    });
  layer.add(circle);
  //setPosiiton of leaf node to new cx,cy
  //addConnection between nodes.

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
    var node2 = addCircleTextNode(layer, "Leaf Node", 0, 0);
    //addConnection(layer, node1, node2)

    const length = 0;
    const angle = 360;

    addLeafNode(layer, node1, node2, angle, length);

  stage.add(layer);
}

document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");
    initializeScript();
 });