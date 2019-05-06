function addCircleTextNode(layer, text, x, y) {
	var complexText = new Konva.Text({
      x: x,
      y: y,
      text: 'COMPLEX TEXT',
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

    layer.add(circle);
    layer.add(complexText);
}

function initializeScript() {
	var stage = new Konva.Stage({
      container: 'container',
      width: 340,
      height: 300
    });

    var layer = new Konva.Layer();

    addCircleTextNode(layer, "TROLO", 150, 150);
    stage.add(layer);
}

document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");
    initializeScript();
 });