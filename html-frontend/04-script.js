/* I will need this when I need to implement automatically adding new leaf nodes.
function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return {"x":nx, "y":ny};
}
*/
function addCircleTextNode(layer, text, x, y) {
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

  //find leafNode cx,cy by using hypotenuse length and angle.
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
    
    var node1 = addCircleTextNode(layer, "COMPLEX TEXT 1", 50, 50);
    var node2 = addCircleTextNode(layer, "COMPLEX TEXT 2", 400, 150);
    addConnection(layer, node1, node2);

  stage.add(layer);
}

document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");
    initializeScript();
 });