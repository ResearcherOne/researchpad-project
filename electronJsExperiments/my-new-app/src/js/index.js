function getMetadataWithDoi(doi, callback) {
	const requestObj = {"doi": doi}; //doi = "10.1103/physrevlett.98.010505"
	ipcRestRenderer.request(backendApi.getCrossrefMetaDataByDoi, requestObj, function(err, responseObj){
		if(!err) {
			var metadata = responseObj.metadata;

			console.log("Metadatafetched from backend.");
			//console.log(JSON.stringify(metadata));
			callback(null, metadata);
		} else {
			console.log("Error occured: "+err.msg);
			callback(err, null);
		}
	});
}

const backendApi = {
	cursorStatusPostTopic: "/cursor-status-changed",
	getCrossrefMetaDataByDoi: "/get-crossref-metadata-by-doi"
};

const sendRequestsTopic = "listen-renderer";
const listenResponsesTopic = "response-to-renderer";

const konvaDivID = "konva-div";
const overlayDivID = "overlay-div";

function Node(ID, metadata, radius){
	this.ID = ID;
	this.metadata = metadata;
	this.radius = radius;

	this.visualObject;

	this.getVisualObject = function() {
		return this.visualObject;
	}

	this.getID = function() {
		return this.ID;
	}

	this.getTitle = function() {
		return this.metadata.title;
	}
}

function ReferenceNode(rootNode, ID, metadata, radius, referencePosition) {
	Node.call(this, ID, metadata, radius);

	this.rootNode = rootNode;
	this.referencePosition = referencePosition;

	var mouseOverLeafNode = function(referenceNodeObject) {
		var nodeCenter = visualizerModule.getNodeCenterById(referenceNodeObject.getID());
		var nodeRadius = visualizerModule.getNodeRadiusById(referenceNodeObject.getID());

		var title = referenceNodeObject.getTitle();
		var overlayText; 
		if (title) {
			overlayText = title;
		} else {
			overlayText = "Title not available.";
		}
		overlayerModule.drawTitleOverlay((nodeCenter.x+nodeRadius), (nodeCenter.y-nodeRadius), overlayText);
	}

	var mouseOutLeafNode = function(referenceNodeObject) {
		overlayerModule.clearTitleOverlay();
	}

	//this.visualObject = visualizerModule.createRootNode(this.radius, this.x, this.y, this.ID, mouseOverLeafNode, mouseOutLeafNode, this);
	this.visualObject = visualizerModule.createReferenceNode(this.rootNode.getVisualObject(), this.referencePosition, this.ID, this.radius, mouseOverLeafNode, mouseOutLeafNode, this);

	ReferenceNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(ReferenceNode.prototype, 'constructor', { 
	    value: ReferenceNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}

function RootNode(ID, metadata, radius, x, y) {
	Node.call(this, ID, metadata, radius);
	
	this.x = x;
	this.y = y;
	this.references = [];

	var mouseOver = function(rootNodeObject) {
		var nodeCenter = visualizerModule.getNodeCenterById(rootNodeObject.getID());
		var nodeRadius = visualizerModule.getNodeRadiusById(rootNodeObject.getID());

		var overlayText; 
		var rootNodeTitle = rootNodeObject.getTitle();
		if (rootNodeTitle) {
			overlayText = rootNodeTitle;
		} else {
			overlayText = "Title not available.";
		}
		console.log(overlayText);
		overlayerModule.drawTitleOverlay((nodeCenter.x+nodeRadius), (nodeCenter.y-nodeRadius), overlayText);
	};
	var mouseOut = function(rootNodeObject) {
		overlayerModule.clearTitleOverlay();
	};

	this.visualObject = visualizerModule.createRootNode(this.radius, this.x, this.y, this.ID, mouseOver, mouseOut, this);

	this.createReference = function(ID, metadata, radius) {
		const referencePosition = this.references.length;
		var referenceNode = new ReferenceNode(this, ID, metadata, radius, referencePosition);
		this.references.push(referenceNode);
	}

	RootNode.prototype = Object.create(Node.prototype);
	Object.defineProperty(RootNode.prototype, 'constructor', { 
	    value: RootNode, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}

function initializeScript() {
	ipcRestRenderer.initialize(sendRequestsTopic, listenResponsesTopic);
	visualizerModule.initializeModule(konvaDivID);
	overlayerModule.initializeModule(overlayDivID);



	/*
	for(var i = 0; i < 40; i++) {
		visualizerModule.createReferenceNode(rootNode, i, "ref-"+i.toString(), leafNodeRadius, mouseOverLeafNode, mouseOutLeafNode);
		visualizerModule.createCitedByNode(rootNode, i, "cited-"+i, leafNodeRadius, mouseOverLeafNode, mouseOutLeafNode);
	}
	*/

	/*
	var nodeID = "ref-0";
	var refNodeNo1 = visualizerModule.getNodeById(nodeID);
	//console.log(JSON.stringify(refNodeNo1));

	var nodeCenter = visualizerModule.getNodeCenterById(nodeID);
	//console.log(JSON.stringify(nodeCenter));
	*/

	const doi = "10.1103/physrevlett.98.010505";
	getMetadataWithDoi(doi, function(err, metadata){
		if(!err) {
			if(metadata.DOI) {
				const rootNodeRadius = 30;
				var rootNodeObject = new RootNode("root-"+metadata.DOI, metadata, 30, 500, 500);
				var rootNode = rootNodeObject.getVisualObject();
				
				var referencesList = metadata.reference;

				const leafNodeRadius = 15;
				var referenceNo = 0;
				referencesList.forEach(function(referenceObj){
					if(referenceObj.DOI) {
						rootNodeObject.createReference("ref-"+referenceObj.DOI, referenceObj, leafNodeRadius);
						//visualizerModule.createReferenceNode(rootNode, referenceNo, "ref-"+referenceObj.DOI, leafNodeRadius, mouseOverLeafNode, mouseOutLeafNode);
					} else {
						rootNodeObject.createReference("ref-"+referenceObj.key, referenceObj, leafNodeRadius);
						//visualizerModule.createReferenceNode(rootNode, referenceNo, "ref-"+referenceObj.key, leafNodeRadius, mouseOverLeafNode, mouseOutLeafNode);
					}
					referenceNo++;
				});
			} else {
				console.log("Doi does not exist in rootnode metadata");
			}
		} else {
			console.log("Error occured while fetching metadata");
		}
	});
}

document.addEventListener("DOMContentLoaded", function(event) {
	console.log("DOM fully loaded and parsed");
	initializeScript();
});