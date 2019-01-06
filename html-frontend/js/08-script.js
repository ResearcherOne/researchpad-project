  /*
  TODO
  +  Complete addLeafNode function using addCircle. Keep things simple. For now, there is no such thing as TextNode.
  Either solve mispositioning of a node or just create a circle as a leaf node for now.
  */

  // var visualizerModule = require("visualizerModule");

  function mouseOverLeafNode(nodeId) {
    var nodeCenter = visualizerModule.getNodeCenterById(nodeId);
    overlayerModule.drawTitleOverlay(nodeCenter.x, nodeCenter.y, "Node ID: "+nodeId);
  }

  function mouseOutLeafNode(nodeId) {
    overlayerModule.clearTitleOverlay();
  } 

  function initializeScript() {
    const konvaDivID = "konva-div";
    const overlayDivID = "overlay-div";
    visualizerModule.initializeModule(konvaDivID);
    overlayerModule.initializeModule(overlayDivID);

    var rootNode = visualizerModule.createRootNode("Root Node", 200, 200);

    for(var i = 0; i < 40; i++) {
      visualizerModule.createReferenceNode(rootNode, i, "ref"+i.toString(), mouseOverLeafNode, mouseOutLeafNode);
      visualizerModule.createCitedByNode(rootNode, i, "cited"+i, mouseOverLeafNode, mouseOutLeafNode);
    }

    var nodeID = "ref0";
    var refNodeNo1 = visualizerModule.getNodeById(nodeID);
    console.log(JSON.stringify(refNodeNo1));

    var nodeCenter = visualizerModule.getNodeCenterById(nodeID);
    console.log(JSON.stringify(nodeCenter));

  }

  document.addEventListener("DOMContentLoaded", function(event) {
  console.log("DOM fully loaded and parsed");
  initializeScript();
  });