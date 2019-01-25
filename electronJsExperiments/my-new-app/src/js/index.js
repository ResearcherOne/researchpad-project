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

function initializeScript() {
	ipcRestRenderer.initialize(sendRequestsTopic, listenResponsesTopic);
	visualizerModule.initializeModule(konvaDivID);
	overlayerModule.initializeModule(overlayDivID);

	const doi = "10.1103/physrevlett.98.010505";
	getMetadataWithDoi(doi, function(err, metadata){
		if(!err) {
			if(metadata.DOI) {
				const rootNodeRadius = 30;
				var rootNodeObject = new RootNode("root-"+metadata.DOI, metadata, 30, 500, 500);
				var rootNode = rootNodeObject.getVisualObject();
				
				var referencesList = metadata.reference;

				const leafNodeRadius = 15;
				referencesList.forEach(function(referenceObj){
					if(referenceObj.DOI) {
						rootNodeObject.createReference("ref-"+referenceObj.DOI, referenceObj, leafNodeRadius);
					} else {
						rootNodeObject.createReference("ref-"+referenceObj.key, referenceObj, leafNodeRadius);
					}
				});

				referencesList.forEach(function(referenceObj){
					if(referenceObj.DOI) {
						rootNodeObject.createCitedBy("citedby-"+referenceObj.DOI, referenceObj, leafNodeRadius);
					} else {
						rootNodeObject.createCitedBy("citedby-"+referenceObj.key, referenceObj, leafNodeRadius);
					}
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