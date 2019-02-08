var crossref = require("crossref")

doi = '10.1103/physrevlett.98.010505'

function isReferenceExists(doiFetchResult) {
	if(doiFetchResult) {
		if(doiFetchResult["reference"] && doiFetchResult["reference"].length > 0) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

function getReferences(doi, callback) {
	crossref.work(doi, function(err, res){
		if(res && res["reference"]) {
			callback(null, res["reference"]);
		} else {
			callback(err, null);
		}
	});
}

var initialRefCount = 0;
var validRefDocCount = 0;
var invalidRefCount = 0;
function printCurrentStats() {
	console.log("validRefDocCount: "+validRefDocCount);
	console.log("invalidRefDocCount: "+invalidRefCount);
	console.log("Total: "+(validRefDocCount+invalidRefCount)+"/"+initialRefCount);
};

function countDocumentsWithValidRef(references) {
	if(references.length>0) {
		validRefDocCount++;
		printCurrentStats();
	} else {
		invalidRefCount++;
		console.log("NO references.");
	}
}


getReferences(doi, function(err, refList){
	if(refList){
		console.log("Ref Count: "+refList.length);
		initialRefCount = refList.length;
		refList.forEach(function(refEntry){
			var refDoi = refEntry["DOI"];
			if(refDoi) {
				console.log(refDoi);
				getReferences(refDoi, function(err, referencesList) {
					if(referencesList) {
						countDocumentsWithValidRef(referencesList);
					} else {
						invalidRefCount++;
						printCurrentStats();
					}
				})
			} else {
				console.log("DOI does not exists: "+JSON.stringify(refEntry));
				invalidRefCount++;
				printCurrentStats();
			}
		});
	} else {
		console.log("Error occoured: "+err);
	}
});
