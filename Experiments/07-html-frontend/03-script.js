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

function addConnection(layer, firstGroup, secondGroup) {
  var firstNode = firstGroup.findOne('Circle');
  var secondNode = secondGroup.findOne('Circle');
  
  var firstAbsolutePosition = firstNode.getAbsolutePosition();
  var secondAbsolutePosition = secondNode.getAbsolutePosition();
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

    var node1 = addCircleTextNode(layer, "COMPLEX TEXT 2", 50, 50);
    var node2 = addCircleTextNode(layer, "COMPLEX TEXT 2", 400, 150);
    addConnection(layer, node1, node2);

  stage.add(layer);
}

document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");
    initializeScript();
 });