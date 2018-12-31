var crossref = require("crossref")

doi = '10.1103/physrevlett.98.010505'

crossref.work(doi, function(err, res){
	console.log("err: "+err);
	console.log("res: "+JSON.stringify(res));
	if(res) {
		console.log(res["reference"]);
	}
});