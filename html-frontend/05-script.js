  /*
  TODO
  +  Complete addLeafNode function using addCircle. Keep things simple. For now, there is no such thing as TextNode.
  Either solve mispositioning of a node or just create a circle as a leaf node for now.
  */

  // var visualizerModule = require("visualizerModule");

  function initializeScript() {
    visualizerModule.initializeModule();

    var rootNode = visualizerModule.createRootNode("Root Node", 200, 200);

    var angle = 0;
    var length = 10;

    for(var i = 0; i <= 360; i = i + 10) {
      visualizerModule.createLeafNode(rootNode, angle+i, length+i);
    }
  }

  document.addEventListener("DOMContentLoaded", function(event) {
  console.log("DOM fully loaded and parsed");
  initializeScript();
  });