  /*
  TODO
  +  Complete addLeafNode function using addCircle. Keep things simple. For now, there is no such thing as TextNode.
  Either solve mispositioning of a node or just create a circle as a leaf node for now.
  */

  // var visualizerModule = require("visualizerModule");

  function initializeScript() {
    const konvaDivID = "konva-div";
    visualizerModule.initializeModule(konvaDivID);

    var rootNode = visualizerModule.createRootNode("Root Node", 200, 200);

    for(var i = 0; i < 40; i++) {
      visualizerModule.createReferenceNode(rootNode, i, "ref"+i.toString());
      visualizerModule.createCitedByNode(rootNode, i, "cited"+i);
    }

    var nodeID = "ref0";
    var refNodeNo1 = visualizerModule.getNodeById(nodeID);
    console.log(JSON.stringify(refNodeNo1));

    var nodeCenter = visualizerModule.getNodeCenterById(nodeID);
    console.log(JSON.stringify(nodeCenter));

    document.getElementById("overlay-div").style.display = "block";
    document.getElementById("overlay-div").style.top = nodeCenter.y+"px"; //y
    document.getElementById("overlay-div").style.left = nodeCenter.x+"px"; //x
  }

  document.addEventListener("DOMContentLoaded", function(event) {
  console.log("DOM fully loaded and parsed");
  initializeScript();
  });