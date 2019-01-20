var crossref = require("crossref")

doi = '10.1103/physrevlett.98.010505'



//Public Functions
function fetchMetadataByDoi(doi, callback) {
	crossref.work(doi, function(err, res){
		if(!err) {
			callback(null, res);
		} else {
			callback(err, null);
		}
	});
}

function fetchReferenceMetadataByDoi(doi, callback) {
	fetchMetadataByDoi(doi, function(err, res){
		if(!err) {
			if(reference) {
				callback(null, reference);
			} else {
				callback({"msg": "References does not exist in metadata."}, null);
			}
		} else {
			callback(err, null);
		}
	});
}

module.exports = {
	fetchMetadataByDoi: fetchMetadataByDoi,
	fetchReferenceMetadataByDoi: fetchReferenceMetadataByDoi
}