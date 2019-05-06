  /*
  TODO
  +  Complete addLeafNode function using addCircle. Keep things simple. For now, there is no such thing as TextNode.
  Either solve mispositioning of a node or just create a circle as a leaf node for now.
  */

  // var visualizerModule = require("visualizerModule");

  function initializeScript() {
    visualizerModule.initializeModule();

    var rootNode = visualizerModule.createRootNode("Root Node", 200, 200);

    for(var i = 0; i < 40; i++) {
      visualizerModule.createReferenceNode(rootNode, i);
      visualizerModule.createCitedByNode(rootNode, i);
    }
  }

  document.addEventListener("DOMContentLoaded", function(event) {
  console.log("DOM fully loaded and parsed");
  initializeScript();
  });