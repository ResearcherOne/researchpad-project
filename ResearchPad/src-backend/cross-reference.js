var crossref = require("crossref");

//doi = '10.1103/physrevlett.98.010505'

//Public Functions
function fetchMetadataByDoi(doi, callback) {
	crossref.work(doi, function(err, res) {
		if (!err) {
			if (res) {
				callback(null, res);
			} else {
				callback({ msg: "Metadata does not exist." }, null);
			}
		} else {
			callback(err, null);
		}
	});
}

module.exports = {
	fetchMetadataByDoi: fetchMetadataByDoi
};
